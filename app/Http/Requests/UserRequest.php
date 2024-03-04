<?php

namespace App\Http\Requests;

use Auth;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Request;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $route = Request::route()->getName();
        if ($route === 'user.create') {
            return $user->can('User Creates');
        } else {
            return $user->can('User Updates');
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'max:255', 'min:1'],
            'email' => ['required', 'email'],
            'password' => ['min:8'],
            'roles' => ['required', 'array'],
            'roles.*' => ['numeric'],
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response(
                [
                    'message' => 'Form Validation Error',
                    'errors' => $validator->getMessageBag(),
                ],
                400
            )
        );
    }
}
