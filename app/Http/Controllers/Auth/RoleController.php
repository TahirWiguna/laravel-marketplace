<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RolRoleRequest;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;

class RoleController extends Controller
{
    private $permission;

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            // prettier-ignore
            $this->permission = [
                "list" => auth()->user()->can('List roles'),
                "view" => auth()->user()->can('View role'),
                "create" => auth()->user()->can('Create role'),
                "update" => auth()->user()->can('Update role'),
                "delete" => auth()->user()->can('Delete role'),
            ];
            return $next($request);
        });
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $req)
    {
        if (!$this->permission['list']) {
            return abort(403);
        }
        return Inertia::render('Auth/Role/RoleList', [
            'permissions' => $this->permission,
            'role_data' => Role::get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        if (!$this->permission['create']) {
            return abort(403);
        }
        return Inertia::render('Auth/Role/RoleForm', [
            'permissions' => $this->permission,
            'type' => 'create',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request): JsonResponse
    {
        if (!$this->permission['create']) {
            return abort(403);
        }
        $data = $request->validated();

        if (Role::where('name', $data['name'])->count() > 0) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['Role name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        $create = Role::create($data);
        return (new RoleResource($create))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        if (!$this->permission['view']) {
            return abort(403);
        }

        return Inertia::render('Auth/Role/RoleForm', [
            'permissions' => $this->permission,
            'type' => 'show',
            'role_data' => $role,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Role $role)
    {
        if (!$this->permission['update']) {
            return abort(403);
        }
        return Inertia::render('Auth/Role/RoleForm', [
            'permissions' => $this->permission,
            'type' => 'edit',
            'role_data' => $role,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Role $role, RoleRequest $request): RoleResource
    {
        if (!$this->permission['update']) {
            return abort(403);
        }
        $data = $request->validated();
        if (
            Role::where('name', $data['name'])
                ->whereNot('id', $role->id)
                ->first()
        ) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['Role name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['updated_at'] = date('Y-m-d H:i:s');

        $role->update($data);
        $role->refresh();

        return new RoleResource($role);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }

        return $role->delete();
    }

    public function destroys(Request $request): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }
        $data = $request->validate([
            'ids' => 'required|array',
        ]);
        return Role::whereIn('id', $data['ids'])->delete();
    }
}
