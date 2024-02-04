<?php

namespace App\Http\Requests;

use Auth;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Request;

class RoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $route = Request::route()->getName();
        if ($route === 'role.create') {
            return $user->can('Role Creates');
        } else {
            return $user->can('Role Updates');
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
            'permissions' => ['nullable', 'array'],
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
