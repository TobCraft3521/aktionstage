export const PATCH = (req: Request, ) => {
  try {

  } catch (e) {
    return Response.json({
      redirectUrl: `/teachers/projects/feedback?msg=Ein Fehler ist aufgetreten&status=error`,
    })
  }
}
