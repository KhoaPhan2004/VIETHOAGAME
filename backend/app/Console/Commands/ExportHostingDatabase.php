<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportHostingDatabase extends Command
{
    protected $signature = 'hosting:export-database {path : Absolute path to the SQL file}';

    protected $description = 'Export MySQL content for a first import into an empty hosting database';

    public function handle(): int
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->error('This export requires the existing MySQL database.');

            return self::FAILURE;
        }
        $path = $this->argument('path');
        if (file_exists($path)) {
            $this->error('The destination already exists. Choose a new path.');

            return self::FAILURE;
        }
        $handle = fopen($path, 'xb');
        if (! $handle) {
            return self::FAILURE;
        }
        $pdo = DB::connection()->getPdo();
        fwrite($handle, "-- Import into a NEW EMPTY database. Contains private admin password hashes.\nSET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n");
        $tables = ['migrations', 'admin_accounts', 'admin_sessions', 'categories', 'games', 'category_game', 'in_progress_games', 'cache', 'cache_locks', 'sessions', 'users', 'password_reset_tokens', 'jobs', 'job_batches', 'failed_jobs'];
        foreach ($tables as $table) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            $row = (array) DB::selectOne('SHOW CREATE TABLE `'.$table.'`');
            $create = array_values($row)[1];
            fwrite($handle, $create.";\n");
            if (in_array($table, ['admin_sessions', 'cache', 'cache_locks', 'sessions', 'password_reset_tokens', 'jobs', 'job_batches', 'failed_jobs'], true)) {
                continue;
            }
            foreach (DB::table($table)->cursor() as $record) {
                $values = array_map(fn ($value) => $value === null ? 'NULL' : $pdo->quote((string) $value), (array) $record);
                $columns = array_map(fn ($name) => '`'.$name.'`', array_keys((array) $record));
                fwrite($handle, 'INSERT INTO `'.$table.'` ('.implode(',', $columns).') VALUES ('.implode(',', $values).");\n");
            }
        }
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($handle);
        $this->info('Database exported. Keep this file private and import it through phpMyAdmin.');

        return self::SUCCESS;
    }
}
