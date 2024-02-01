<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    private array $modules = ['permission', 'role'];

    private array $pluralActions = ['List'];

    private array $singularActions = ['View', 'Create', 'Update', 'Delete'];

    private array $extraPermissions = [];

    private string $defaultRole = 'Super Admin';

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create profiles
        foreach ($this->modules as $module) {
            $plural = Str::plural($module);
            $singular = $module;
            foreach ($this->pluralActions as $action) {
                Permission::firstOrCreate([
                    'name' => $action . ' ' . $plural,
                ]);
            }
            foreach ($this->singularActions as $action) {
                Permission::firstOrCreate([
                    'name' => $action . ' ' . $singular,
                ]);
            }
        }

        foreach ($this->extraPermissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
            ]);
        }

        // Create default role
        $role = Role::firstOrCreate([
            'name' => $this->defaultRole,
        ]);

        // Add all permissions to default role
        $role->syncPermissions(
            Permission::all()
                ->pluck('name')
                ->toArray()
        );

        // Assign default role to first database user
        if ($user = User::first()) {
            $user->syncRoles([$this->defaultRole]);
        }
    }
}
