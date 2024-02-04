<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::where('email', 'admin@gmail.com')->first();
    $this->user2 = User::factory()->create();
    $this->post = [
        'name' => 'Super Admin testing',
    ];
    $this->post_update = [
        'name' => 'Super Admin testing Updated',
    ];
    $this->notfound_id = 999;
});

// LIST
test('render list page unauthorize', function () {
    $response = $this->get(route('role.index'));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render list page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('role.index'));
    $response->assertStatus(403);
});

test('render list page success', function () {
    $response = $this->actingAs($this->user)->get(route('role.index'));
    $response->assertStatus(200);
});

// VIEW
test('render view page not found', function () {
    $response = $this->actingAs($this->user)->get(route('role.show', $this->notfound_id));
    $response->assertStatus(404);
});

test('render view page unauthorize', function () {
    $role = Role::create($this->post);

    $response = $this->get(route('role.show', $role->id));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render view page no permission', function () {
    $role = Role::create($this->post);

    $response = $this->actingAs($this->user2)->get(route('role.show', $role->id));
    $response->assertStatus(403);
});

test('render view page success', function () {
    $role = Role::create($this->post);

    $response = $this->actingAs($this->user)->get(route('role.show', $role->id));
    $response->assertStatus(200);
});

// CREATE
test('render create page unauthorize', function () {
    $this->get(route('role.create'))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render create page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('role.create'));
    $response->assertStatus(403);
});

test('render create page success', function () {
    $this->actingAs($this->user)
        ->get(route('role.create'))
        ->assertStatus(200);
});

// STORE
test('create role unauthorize', function () {
    $this->post(route('role.store'), $this->post)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('create role no permission', function () {
    $response = $this->actingAs($this->user2)->post(route('role.store'));
    $response->assertStatus(403);
});

test('create role request validation', function () {
    $response = $this->actingAs($this->user)->post(route('role.store'));
    $response->assertStatus(400)->assertJsonStructure(['message', 'errors']);
});

test('create role success', function () {
    $this->actingAs($this->user)
        ->post(route('role.store'), $this->post)
        ->assertStatus(201)
        ->assertJson([
            'data' => [
                'name' => $this->post['name'],
            ],
        ]);
});

test('create role duplicate name', function () {
    Role::create($this->post);

    $this->actingAs($this->user)
        ->post(route('role.store'), $this->post)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['Role name has been used'],
            ],
        ]);
});

// EDIT
test('render edit page unauthorize', function () {
    $this->get(route('role.edit', $this->notfound_id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render edit page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('role.edit', 1));
    $response->assertStatus(403);
});

test('render edit page not found', function () {
    $response = $this->actingAs($this->user)->get(route('role.edit', $this->notfound_id));
    $response->assertStatus(404);
});

test('render edit page success', function () {
    $role = Role::create($this->post);

    $this->actingAs($this->user)
        ->get(route('role.edit', $role->id))
        ->assertStatus(200);
});

// UPDATE
test('update role unauthorize', function () {
    $role = Role::create($this->post);

    $this->put(route('role.update', $role->id), $this->post_update)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('update role no permission', function () {
    $role = Role::create($this->post);
    $response = $this->actingAs($this->user2)->put(route('role.update', $role->id));
    $response->assertStatus(403);
});

test('update role not found', function () {
    $response = $this->actingAs($this->user)->put(route('role.update', $this->notfound_id));
    $response->assertStatus(404);
});

test('update role success', function () {
    $role = Role::create($this->post);
    $this->actingAs($this->user)
        ->put(route('role.update', $role->id), $this->post_update)
        ->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['id', 'name', 'created_at', 'updated_at'],
        ]);
});

test('update role duplicate name', function () {
    $role = Role::create($this->post);
    $exist = [
        'name' => 'Super Admin',
    ];

    $this->actingAs($this->user)
        ->put(route('role.update', $role->id), $exist)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['Role name has been used'],
            ],
        ]);
});

// DELETE
test('delete role unauthorize', function () {
    $role = Role::create($this->post);

    $this->delete(route('role.destroy', $role->id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('delete role no permission', function () {
    $role = Role::create($this->post);
    $response = $this->actingAs($this->user2)->delete(route('role.destroy', $role->id));
    $response->assertStatus(403);
});

test('delete role not found', function () {
    $response = $this->actingAs($this->user)->delete(route('role.destroy', $this->notfound_id));
    $response->assertStatus(404);
});

test('delete role success', function () {
    $role = Role::create($this->post);
    $this->actingAs($this->user)
        ->delete(route('role.destroy', $role->id))
        ->assertStatus(200);
});

test('delete bulks role success', function () {
    $this->actingAs($this->user)
        ->delete(route('role.destroys'), ['ids' => ['2', '3']])
        ->assertStatus(200);
});
