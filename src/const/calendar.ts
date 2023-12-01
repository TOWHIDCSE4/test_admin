export const SQUARE_TYPE = {
    CLOSE: 1, // Lịch không mở
    REGULAR: 2, // Lịch thường kỳ đã mở
    REGISTERED_REGULAR: 3, // Lịch thường kỳ đã được ghép với học viên
    REGULAR_BOOKED: 4, // Lịch thường kỳ chưa được ghép với học viên và được học viên tự do book
    FLEXIBLE: 5, // Lịch linh hoạt đã mở
    FLEXIBLE_BOOKED: 6, // Lịch linh hoạt đã được book bởi học viên
    CLOSE_REGULAR: 7 // Lịch linh hoạt đã được book bởi học viên
}
