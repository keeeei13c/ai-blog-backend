export const createResponse = {
  success: <T>(data: T, status = 200) => ({
    success: true,
    data
  }),
  
  error: (message: string, status = 500) => ({
    success: false,
    message
  })
}