<?php

namespace App\Console\Commands;

use App\Models\AdminAccount;
use App\Models\AdminSession;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AdminPasswordCommand extends Command
{
    protected $signature = 'admin:password {--import-env : Import the existing password once}';

    protected $description = 'Create or update the hashed administrator password in the database';

    public function handle(): int
    {
        if ($this->option('import-env') && AdminAccount::where('username', 'admin')->exists()) {
            $this->error('An administrator already exists. Import cancelled.');

            return self::FAILURE;
        }

        $password = $this->option('import-env') ? env('ADMIN_PASSWORD') : $this->secret('Mật khẩu admin mới');
        if (! is_string($password) || $password === '' || (! $this->option('import-env') && strlen($password) < 12)) {
            $this->error('Password is missing or too short (minimum 12 characters for a new password).');

            return self::FAILURE;
        }

        DB::transaction(function () use ($password): void {
            $account = AdminAccount::updateOrCreate(['username' => 'admin'], ['password' => $password, 'active' => true]);
            AdminSession::where('admin_account_id', $account->id)->delete();
        });
        $this->info('Administrator password saved as a hash. Existing sessions revoked.');

        return self::SUCCESS;
    }
}
