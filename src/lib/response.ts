import { NextResponse } from "next/server";

export function successResponse(data: unknown, message = "Success", status = 200) {
    return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message = "Something went wrong", status = 500) {
    return NextResponse.json({ success: false, message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
    return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
    return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
    return NextResponse.json({ success: false, message }, { status: 404 });
}

export function validationErrorResponse(message = "Validation error", errors?: unknown) {
    return NextResponse.json({ success: false, message, errors }, { status: 422 });
}
