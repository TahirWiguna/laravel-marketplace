<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Json;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Yajra\DataTables\Facades\DataTables;

class UserController extends Controller
{
    private $permission = [];

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            $this->permission = [
                'list' => $user->can('User Lists'),
                'view' => $user->can('User Views'),
                'create' => $user->can('User Creates'),
                'update' => $user->can('User Updates'),
                'delete' => $user->can('User Deletes'),
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
        // dd('hi', date('H:i:s.u'));

        return Inertia::render('Auth/User/UserList', [
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

        return Inertia::render('Auth/User/UserForm', [
            'permissions' => $this->permission,
            'type' => 'create',
            'role_data' => Role::get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): JsonResponse
    {
        if (!$this->permission['create']) {
            return abort(403);
        }
        $data = $request->validated();
        if (User::where('name', $data['name'])->count() > 0) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['User name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        if (User::where('email', $data['email'])->count() > 0) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'email' => ['Email has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['created_at'] = date('Y-m-d H:i:s');

        $user = User::create($data);
        $user->assignRole($data['roles']);

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        if (!$this->permission['view']) {
            return abort(403);
        }

        $user = $user->load('roles')->toArray();
        $user['roles'] = array_column($user['roles'], 'id');

        return Inertia::render('Auth/User/UserForm', [
            'permissions' => $this->permission,
            'type' => 'show',
            'form_data' => $user,
            'role_data' => Role::get(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        if (!$this->permission['update']) {
            return abort(403);
        }

        $user = $user->load('roles')->toArray();
        $user['roles'] = array_column($user['roles'], 'id');

        return Inertia::render('Auth/User/UserForm', [
            'permissions' => $this->permission,
            'type' => 'edit',
            'form_data' => $user,
            'role_data' => Role::get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(User $user, UserRequest $request): UserResource
    {
        if (!$this->permission['update']) {
            return abort(403);
        }
        $data = $request->validated();
        if (
            User::where('name', $data['name'])
                ->whereNot('id', $user->id)
                ->first()
        ) {
            throw new HttpResponseException(
                response(
                    [
                        'message' => 'Form Validation Error',
                        'errors' => [
                            'name' => ['User name has been used'],
                        ],
                    ],
                    400
                )
            );
        }

        $data['updated_at'] = date('Y-m-d H:i:s');

        $user->update($data);
        if (isset($data['users'])) {
            $user->users()->sync($data['users']);
        }
        $user->refresh();

        return new UserResource($user);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }

        return $user->delete();
    }

    public function destroys(Request $request): bool
    {
        if (!$this->permission['delete']) {
            return abort(403);
        }
        $data = $request->validate([
            'ids' => 'required|array',
        ]);
        return User::whereIn('id', $data['ids'])->delete();
    }

    public function datatables(Request $request): JsonResponse
    {
        if (!$this->permission['list']) {
            return abort(403);
        }

        $data = User::get();
        return DataTables::of($data)->make(true);
    }
}
