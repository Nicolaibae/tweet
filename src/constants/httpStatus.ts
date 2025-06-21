const httpStatus={
  ok:200,
  created:201,
  accepted:202,
  no_content:204,
  moved_permanently:301,
  unprocessable_entity:422,
  not_found:404,
  interval_server_error:500

}as const
export default httpStatus
