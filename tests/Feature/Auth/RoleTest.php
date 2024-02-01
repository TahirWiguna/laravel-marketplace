<?php

use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->user = User::where('email', 'admin@gmail.com')->first();
    $this->post = [
        'name' => 'Super Admin testing',
    ];
});

test('render page unauthorize', function () {
    $response = $this->get('/admin/role');
    $response->assertStatus(302)->assertRedirect('/login');
});

test('render page success', function () {
    $response = $this->actingAs($this->user)->get('/admin/role');
    $response->assertStatus(200);
});

test('create role unauthorize', function () {
    $this->post('/admin/role', $this->post)
        ->assertStatus(302)
        ->assertRedirect('/login');
});

test('create role success', function () {
    $this->actingAs($this->user)
        ->post('/admin/role', $this->post)
        ->assertStatus(201)
        // ->assertJson([
        //     'data' => [
        //         'name' => $this->post['name'],
        //     ],
        // ])
        ->assertJsonStructure([
            'data' => ['name'],
        ]);

    $this->assertAuthenticated();
});

test('create role duplicate name', function () {
    Role::create($this->post);

    $this->actingAs($this->user)
        ->post('/admin/role', $this->post)
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Form Validation Error',
            'errors' => [
                'name' => ['Role name has been used'],
            ],
        ]);

    $this->assertAuthenticated();
});
