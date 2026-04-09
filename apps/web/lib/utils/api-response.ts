
export function success(data: any, status = 200, headers: any = {}) {
  return Response.json(
    { success: true, data },
    { status, headers }
  );
}

export function fail(message: string, code = "bad_request", status = 400, headers: any = {}) {
  return Response.json(
    {
      success: false,
      error: { message, code },
    },
    { status, headers }
  );
}