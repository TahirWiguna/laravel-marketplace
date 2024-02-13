<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionRequest;
use App\Http\Resources\PermissionResource;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class PermissionController extends Controller
{
    private $permission = [];

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            $this->permission = [
                'list' => $user->can('Permission Lists'),
                'view' => $user->can('Permission Views'),
                'create' => $user->can('Permission Creates'),
                'update' => $user->can('Permission Updates'),
                'delete' => $user->can('Permission Deletes'),
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

        return Inertia::render('Auth/Permission/PermissionList', [
            'permissions' => $this->permission,
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

        return Inertia::render('Auth/Permission/PermissionForm', [
            'permissions' => $this->permission,
            'type' => 'create',
            'permission_data' => Permission::get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PermissionRequest $request): JsonResponse
    {
        if (!$this->permission['create']) {
            return abort(403);
        }
        $data = $request->validated();
        if (Permission::where('name', $data['name'])->count() > 0) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['Permission name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        $permission = Permission::create($data);
        if (isset($data['permissions'])) {
            $permission->permissions()->sync($data['permissions']);
        }

        return (new PermissionResource($permission))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Permission $permission)
    {
        if (!$this->permission['view']) {
            return abort(403);
        }
        $permission = $permission->load('permissions')->toArray();
        $permission['permissions'] = array_column($permission['permissions'], 'id');

        return Inertia::render('Auth/Permission/PermissionForm', [
            'permissions' => $this->permission,
            'type' => 'show',
            'permission_data' => $permission,
            'permission_data' => Permission::get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Permission $permission)
    {
        if (!$this->permission['update']) {
            return abort(403);
        }

        $permission = $permission->load('permissions')->toArray();
        $permission['permissions'] = array_column($permission['permissions'], 'id');

        return Inertia::render('Auth/Permission/PermissionForm', [
            'permissions' => $this->permission,
            'type' => 'edit',
            'permission_data' => $permission,
            'permission_data' => Permission::get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Permission $permission, PermissionRequest $request): PermissionResource
    {
        if (!$this->permission['update']) {
            return abort(403);
        }
        $data = $request->validated();
        if (
            Permission::where('name', $data['name'])
                ->whereNot('id', $permission->id)
                ->first()
        ) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['Permission name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['updated_at'] = date('Y-m-d H:i:s');

        $permission->update($data);
        if (isset($data['permissions'])) {
            $permission->permissions()->sync($data['permissions']);
        }
        $permission->refresh();

        return new PermissionResource($permission);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }

        return $permission->delete();
    }

    public function destroys(Request $request): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }
        $data = $request->validate([
            'ids' => 'required|array',
        ]);
        return Permission::whereIn('id', $data['ids'])->delete();
    }

    public function datatables(Request $request): JsonResponse
    {
        if (!$this->permission['list']) {
            return abort(403);
        }

        $data = Permission::get();
        return DataTables::of($data)->make(true);
    }
}
