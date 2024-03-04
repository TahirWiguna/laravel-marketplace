<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::where('email', 'admin@gmail.com')->first();
    $this->user2 = User::factory()->create();
    $this->post = [
        'name' => 'User Test',
        'email' => 'test@ut.test',
        'password' => 'rahasia123!',
        'roles' => [1],
    ];
    $this->post_update = [
        'name' => 'Super Admin testing Updated',
    ];
    $this->notfound_id = 999;
});

// LIST
test('render list page unauthorize', function () {
    $response = $this->get(route('user.index'));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render list page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('user.index'));
    $response->assertStatus(403);
});

test('render list page success', function () {
    $response = $this->actingAs($this->user)->get(route('user.index'));
    $response->assertStatus(200);
});

// VIEW
test('render view page not found', function () {
    $response = $this->actingAs($this->user)->get(route('user.show', $this->notfound_id));
    $response->assertStatus(404);
});

test('render view page unauthorize', function () {
    $user = User::create($this->post);

    $response = $this->get(route('user.show', $user->id));
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render view page no permission', function () {
    $user = User::create($this->post);

    $response = $this->actingAs($this->user2)->get(route('user.show', $user->id));
    $response->assertStatus(403);
});

test('render view page success', function () {
    $user = User::create($this->post);

    $response = $this->actingAs($this->user)->get(route('user.show', $user->id));
    $response->assertStatus(200);
});

// CREATE
test('render create page unauthorize', function () {
    $this->get(route('user.create'))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render create page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('user.create'));
    $response->assertStatus(403);
});

test('render create page success', function () {
    $this->actingAs($this->user)
        ->get(route('user.create'))
        ->assertStatus(200);
});

// STORE
test('create user unauthorize', function () {
    $this->post(route('user.store'), $this->post)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('create user no permission', function () {
    $response = $this->actingAs($this->user2)->post(route('user.store'));
    $response->assertStatus(403);
});

test('create user request validation', function () {
    $response = $this->actingAs($this->user)->post(route('user.store'));
    $response->assertStatus(400)->assertJsonStructure(['message', 'errors']);
});

test('create user success', function () {
    $this->actingAs($this->user)
        ->post(route('user.store'), $this->post)
        ->assertStatus(201);
    // ->assertJson([
    //     'data' => $this->post,
    // ]);
});

test('create user duplicate name', function () {
    User::create($this->post);

    $this->actingAs($this->user)
        ->post(route('user.store'), $this->post)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['User name has been used'],
            ],
        ]);
});

// EDIT
test('render edit page unauthorize', function () {
    $this->get(route('user.edit', $this->notfound_id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('render edit page no permission', function () {
    $response = $this->actingAs($this->user2)->get(route('user.edit', 1));
    $response->assertStatus(403);
});

test('render edit page not found', function () {
    $response = $this->actingAs($this->user)->get(route('user.edit', $this->notfound_id));
    $response->assertStatus(404);
});

test('render edit page success', function () {
    $user = User::create($this->post);

    $this->actingAs($this->user)
        ->get(route('user.edit', $user->id))
        ->assertStatus(200);
});

// UPDATE
test('update user unauthorize', function () {
    $user = User::create($this->post);

    $this->put(route('user.update', $user->id), $this->post_update)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('update user no permission', function () {
    $user = User::create($this->post);
    $response = $this->actingAs($this->user2)->put(route('user.update', $user->id));
    $response->assertStatus(403);
});

test('update user not found', function () {
    $response = $this->actingAs($this->user)->put(route('user.update', $this->notfound_id));
    $response->assertStatus(404);
});

test('update user success', function () {
    $user = User::create($this->post);
    $this->actingAs($this->user)
        ->put(route('user.update', $user->id), $this->post_update)
        ->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['id', 'name', 'created_at', 'updated_at'],
        ]);
});

test('update user duplicate name', function () {
    User::create($this->post);

    $this->actingAs($this->user)
        ->put(route('user.update', $this->user->id), $this->post)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['User name has been used'],
            ],
        ]);
});

// DELETE
test('delete user unauthorize', function () {
    $user = User::create($this->post);

    $this->delete(route('user.destroy', $user->id))
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('delete user no permission', function () {
    $user = User::create($this->post);
    $response = $this->actingAs($this->user2)->delete(route('user.destroy', $user->id));
    $response->assertStatus(403);
});

test('delete user not found', function () {
    $response = $this->actingAs($this->user)->delete(route('user.destroy', $this->notfound_id));
    $response->assertStatus(404);
});

test('delete user success', function () {
    $user = User::create($this->post);
    $this->actingAs($this->user)
        ->delete(route('user.destroy', $user->id))
        ->assertStatus(200);
});

test('delete bulks user success', function () {
    $this->actingAs($this->user)
        ->delete(route('user.destroys'), ['ids' => ['2', '3']])
        ->assertStatus(200);
});
