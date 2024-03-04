<?php

use App\Models\Permission;
use App\Models\User;

beforeEach(function () {
    $this->user = User::where('email', 'admin@gmail.com')->first();
    $this->user2 = User::factory()->create();
    $this->post = [
        'name' => 'Create test permission',
    ];
    $this->post_update = [
        'name' => 'Create test permission updated',
    ];
    $this->notfound_id = 999;
});

// LIST
test('render list page unauthorize', function () {
    $response = $this->get(route('permission.index'));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render list page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('permission.index'));
    $response->assertStatus(403);
});

test('render list page success', function () {
    $response = $this->actingAs($this->user)->get(route('permission.index'));
    $response->assertStatus(200);
});

// VIEW
test('render view page not found', function () {
    $response = $this->actingAs($this->user)->get(route('permission.show', $this->notfound_id));
    $response->assertStatus(404);
});

test('render view page unauthorize', function () {
    $permission = Permission::create($this->post);

    $response = $this->get(route('permission.show', $permission->id));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render view page no permission', function () {
    $permission = Permission::create($this->post);

    $response = $this->actingAs($this->user2)->get(route('permission.show', $permission->id));
    $response->assertStatus(403);
});

test('render view page success', function () {
    $permission = Permission::create($this->post);

    $response = $this->actingAs($this->user)->get(route('permission.show', $permission->id));
    $response->assertStatus(200);
});

// CREATE
test('render create page unauthorize', function () {
    $this->get(route('permission.create'))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render create page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('permission.create'));
    $response->assertStatus(403);
});

test('render create page success', function () {
    $this->actingAs($this->user)
        ->get(route('permission.create'))
        ->assertStatus(200);
});

// STORE
test('create permission unauthorize', function () {
    $this->post(route('permission.store'), $this->post)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('create permission no permission', function () {
    $response = $this->actingAs($this->user2)->post(route('permission.store'));
    $response->assertStatus(403);
});

test('create permission request validation', function () {
    $response = $this->actingAs($this->user)->post(route('permission.store'));
    $response->assertStatus(400)->assertJsonStructure(['message', 'errors']);
});

test('create permission success', function () {
    $this->actingAs($this->user)
        ->post(route('permission.store'), $this->post)
        ->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => $this->post['name'],
            ],
        ]);
});

test('create permission duplicate name', function () {
    Permission::create($this->post);

    $this->actingAs($this->user)
        ->post(route('permission.store'), $this->post)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['Permission name has been used'],
            ],
        ]);
});

// EDIT
test('render edit page unauthorize', function () {
    $this->get(route('permission.edit', $this->notfound_id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render edit page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('permission.edit', 1));
    $response->assertStatus(403);
});

test('render edit page not found', function () {
    $response = $this->actingAs($this->user)->get(route('permission.edit', $this->notfound_id));
    $response->assertStatus(404);
});

test('render edit page success', function () {
    $permission = Permission::create($this->post);

    $this->actingAs($this->user)
        ->get(route('permission.edit', $permission->id))
        ->assertStatus(200);
});

// UPDATE
test('update permission unauthorize', function () {
    $permission = Permission::create($this->post);

    $this->put(route('permission.update', $permission->id), $this->post_update)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('update permission no permission', function () {
    $permission = Permission::create($this->post);
    $response = $this->actingAs($this->user2)->put(route('permission.update', $permission->id));
    $response->assertStatus(403);
});

test('update permission not found', function () {
    $response = $this->actingAs($this->user)->put(route('permission.update', $this->notfound_id));
    $response->assertStatus(404);
});

test('update permission success', function () {
    $permission = Permission::create($this->post);
    $this->actingAs($this->user)
        ->put(route('permission.update', $permission->id), $this->post_update)
        ->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['id', 'name', 'created_at', 'updated_at'],
        ]);
});

test('update permission duplicate name', function () {
    $permission_exist = Permission::create($this->post);
    $permission = Permission::create($this->post_update);
    $exist = [
        'name' => $permission_exist->name,
    ];

    $this->actingAs($this->user)
        ->put(route('permission.update', $permission->id), $exist)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['Permission name has been used'],
            ],
        ]);
});

// DELETE
test('delete permission unauthorize', function () {
    $permission = Permission::create($this->post);

    $this->delete(route('permission.destroy', $permission->id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('delete permission no permission', function () {
    $permission = Permission::create($this->post);
    $response = $this->actingAs($this->user2)->delete(route('permission.destroy', $permission->id));
    $response->assertStatus(403);
});

test('delete permission not found', function () {
    $response = $this->actingAs($this->user)->delete(route('permission.destroy', $this->notfound_id));
    $response->assertStatus(404);
});

test('delete permission success', function () {
    $permission = Permission::create($this->post);
    $this->actingAs($this->user)
        ->delete(route('permission.destroy', $permission->id))
        ->assertStatus(200);
});

test('delete bulks permission success', function () {
    $this->actingAs($this->user)
        ->delete(route('permission.destroys'), ['ids' => ['2', '3']])
        ->assertStatus(200);
});
