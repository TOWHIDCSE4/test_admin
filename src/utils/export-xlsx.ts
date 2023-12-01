import moment from 'moment'
import * as XLSX from 'xlsx'

import {
    EnumRecommendSection,
    EnumRecommendStatus,
    EnumClassify,
    EnumLevel,
    EnumReportType
} from 'const/reports'
import { CUSTOMER_TYPE } from 'const/customer'
import sanitizeHtml from 'sanitize-html'

export const exportToTrialBookingExcel = (
    nameFile: string,
    cols: any,
    data: any
) => {
    /* data: [["Col1", "Col2"], ["val1", "val2"]] */
    /* convert state to workbook */
    const ws = XLSX.utils.aoa_to_sheet([[...cols], ...data])
    const wb = XLSX.utils.book_new()

    const colNum = XLSX.utils.decode_col('M') // decode_col converts Excel col name to an integer for col #
    /* get worksheet range */
    const range = XLSX.utils.decode_range(ws['!ref'])
    for (let i = range.s.r + 1; i <= range.e.r; ++i) {
        /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
        const ref = XLSX.utils.encode_cell({ r: i, c: colNum })
        /* if the particular row did not contain data for the column, the cell will not be generated */
        if (!ws[ref]) continue
        /* `.t == "n"` for number cells */
        // if (ws[ref].t !== 'n') continue
        /* assign the `.z` number format */

        ws[ref].s = { alignment: { wrapText: true } }
    }

    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${nameFile}.xlsx`)
}

export const exportToFileXlsx = (nameFile: string, data: any[]) => {
    /* data: [["Col1", "Col2"], ["val1", "val2"]] */
    /* convert state to workbook */
    const ws = XLSX.utils.aoa_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${nameFile}.xlsx`, {
        bookSST: true
    })
}
export const exportCustomerToXlsx = (
    nameFile: string,
    data: any,
    type: any
) => {
    try {
        let COLS_TO_EXPORT = []
        if (type === 'only_student') {
            COLS_TO_EXPORT = [
                'Fullname',
                'Username',
                'Email',
                'Phone',
                'Register At',
                'Skype',
                'Supporter',
                'Zalo ID'
            ]
        } else {
            COLS_TO_EXPORT = [
                'Fullname',
                'Username',
                'Email',
                'Phone',
                'Register At',
                'Skype',
                'Level',
                'Supporter',
                'Recent Packages',
                'Number of lessons remaining',
                'Expired date',
                'Customer Type',
                'Student Type',
                'Student status'
            ]
        }
        const exportData = []
        data.forEach((element) => {
            const Fullname = element.full_name
            const Username = element.username
            const Email = element.email
            const Phone = element.phone_number
            const RegisterAt = moment(element.created_time).format('DD/MM/YYYY')
            const Skype = element.skype_account
            const Level = element.student?.student_levels?.name
            const Supporter = element.student?.staff
                ? `${element.student?.staff?.username} - ${element.student?.staff?.fullname}`
                : ''
            const zaloID = element.zalo_id
            let lastHistory = null
            const customer_care = element.cs_info?.customer_care
            if (customer_care && customer_care.length) {
                const lastCustomerCare = customer_care[customer_care.length - 1]
                if (
                    lastCustomerCare?.history &&
                    lastCustomerCare?.history.length
                ) {
                    lastHistory =
                        lastCustomerCare?.history[
                            lastCustomerCare?.history?.length - 1
                        ]
                }
            }

            let CustomerType = String(lastHistory?.customer_type) || ''
            if (CustomerType) {
                CustomerType = CUSTOMER_TYPE[CustomerType]
            }
            const StudentStatus =
                element.is_active === true ? 'Active' : 'Inactive'
            let checkHasActivePackage = false
            if (type === 'only_student') {
                exportData.push([
                    Fullname,
                    Username,
                    Email,
                    Phone,
                    RegisterAt,
                    Skype,
                    Supporter,
                    zaloID
                ])
            } else {
                if (element.orderedPackages && element.orderedPackages.length) {
                    element.orderedPackages.forEach((element2) => {
                        if (
                            element2.activation_date &&
                            element2.expired_date &&
                            moment(element2?.expired_date) > moment() &&
                            element2.number_class > 0 &&
                            element2.number_class <
                                element2.original_number_class
                        ) {
                            const RecentPackages = element2.package_name
                            const NumberOfLessonsRemaining =
                                element2.number_class
                            const ExpiredDate = moment(
                                element2.expired_date
                            ).format('DD/MM/YYYY')
                            let StudentType = element2.type
                            if (StudentType === 2) {
                                StudentType = 'PREMIUM'
                            } else if (StudentType === 1) {
                                StudentType = 'STANDARD'
                            } else {
                                StudentType = 'TRIAL'
                            }
                            checkHasActivePackage = true
                            exportData.push([
                                Fullname,
                                Username,
                                Email,
                                Phone,
                                RegisterAt,
                                Skype,
                                Level,
                                Supporter,
                                RecentPackages,
                                NumberOfLessonsRemaining,
                                ExpiredDate,
                                CustomerType,
                                StudentType,
                                StudentStatus
                            ])
                        }
                    })
                }
                if (!checkHasActivePackage) {
                    exportData.push([
                        Fullname,
                        Username,
                        Email,
                        Phone,
                        RegisterAt,
                        Skype,
                        Level,
                        Supporter,
                        '',
                        '',
                        '',
                        '',
                        '',
                        StudentStatus
                    ])
                }
            }
        })
        /* data: [["Col1", "Col2"], ["val1", "val2"]] */
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const exportReportToXlsx = (nameFile: string, data: any) => {
    try {
        const COLS_TO_EXPORT = [
            'Date Created',
            'Create By',
            'Username',
            'Fullname',
            'Content',
            'Section',
            'Classify',
            'Level',
            'Handler (CS)',
            'Cause',
            'Solution',
            'Other Handler',
            'Feedback from Other handler',
            'Status'
        ]
        const exportData = []
        data.forEach((element) => {
            const DateCreated = moment(element.created_time).format(
                'DD/MM/YYYY HH:mm'
            )
            const CreateBy = `${element.created_user?.fullname}(${element.created_user?.username}-${element.created_user?.department?.name})`
            const Username = element.report_user?.username
            const Fullname = element.report_user?.full_name
            const Content = sanitizeHtml(element.recommend_content).replace(
                /<[^>]+>/g,
                ''
            )
            const Section = EnumRecommendSection[element.recommend_section]
            const Classify = EnumClassify[element.classify]
            const Level = EnumLevel[element.level]
            const Handler = element.resolve_user
                ? `${element.resolve_user?.fullname}(${element.resolve_user?.username})`
                : ''
            const Cause = element.error_cause
            const Solution = sanitizeHtml(element.report_solution).replace(
                /<[^>]+>/g,
                ''
            )
            const OtherHandler = element.otherHandler
                ? `${element.otherHandler?.fullname}(${element.otherHandler?.username}-${element.otherDepartment?.name})`
                : ''
            const FeedbackFromOther = sanitizeHtml(
                element.department_staff_feedback
            ).replace(/<[^>]+>/g, '')
            const Status = EnumRecommendStatus[element.recommend_status]

            exportData.push([
                DateCreated,
                CreateBy,
                Username,
                Fullname,
                Content,
                Section,
                Classify,
                Level,
                Handler,
                Cause,
                Solution,
                OtherHandler,
                FeedbackFromOther,
                Status
            ])
        })
        /* data: [["Col1", "Col2"], ["val1", "val2"]] */
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const exportSalaryXlsx = (nameFile: string, data: any) => {
    try {
        /* eslint-disable spaced-comment */
        const COLS_TO_EXPORT = [
            'Teacher',
            'Email',
            'Currency',
            'Salary/Slot',

            //A1
            'Slot done and write memo',
            'Amount A1',
            //A2
            'Slot student absent',
            'Rate',
            'Amount A2',
            //T1
            'Total Base Salary T1 (T1 = A1 + A2)',

            //A3
            'Weekend',
            'Rate',
            'Amount A3',
            //A4
            'Attendance Rate',
            'Amount Attendance A4',
            //A5
            'Conversion',
            'Rate',
            'Amount A5',
            //A6
            'Referral',
            'Rate',
            'Amount A6',
            //A7
            'Teaching Substitute',
            'Rate',
            'Amount A7',
            //T2
            'Total Bonus T2 (T2 = A3 + A4 + A5 + A6 + A7)',

            //A8
            'Absent Trial',
            'Rate',
            'Amount A8',
            //A9
            'Absent First 3 Slot',
            'Rate',
            'Amount A9',
            //A10
            'Absent Without Leave Request',
            'Rate',
            'Amount A10',
            //A11
            'Absent With Leave Request < 1h',
            'Rate',
            'Amount A11',
            //A12
            'Absent With Leave Request < 2h',
            'Rate',
            'Amount A12',
            //A13
            'Absent With Leave Request < 3h',
            'Rate',
            'Amount A13',
            //A14
            'Absent With Leave Request > 3h',
            'Rate',
            'Amount A14',
            //A15
            'Over limit',
            'Rate',
            'Amount A15',
            //A16
            'Absent Regular Time First 3 Slot',
            'Rate',
            'Amount A16',
            //A17
            'Absent Regular With Leave Request < 1h',
            'Rate',
            'Amount A17',
            //A18
            'Absent Regular With Leave Request < 2h',
            'Rate',
            'Amount A18',
            //A19
            'Absent Regular With Leave Request < 3h',
            'Rate',
            'Amount A19',
            //A20
            'Absent Regular With Leave Request > 3h',
            'Rate',
            'Amount A20',
            //A21
            'Over limit',
            'Rate',
            'Amount A21',
            //A22
            'Late memo fine',
            'Rate',
            'Amount A22',

            //T3
            'Total Fine T3 (T3 = A8 + A9 + A10 + A11 + A12 + A13 + A14 + A15 + A16 + A17 + A18 + A19 + A20 + A21 + A22)',

            //T
            'Total Salary (T = T1 + T2 - T3)'
        ]
        const exportData = []
        data.forEach((element) => {
            const name = element?.teacher?.full_name
            const email = element?.teacher?.email
            const currency = element?.currency
            const salarySlot = element?.salary_slot

            const numSlotDone = element?.base_salary?.list_slot_done?.length
            const A1 = element?.base_salary?.total_salary_slot_done

            const numSlotStudentAbsent =
                element?.base_salary?.list_slot_student_absent?.length
            const rateA2 = element.percent_salary_student_absent
            const A2 = element?.base_salary?.total_salary_slot_student_absent

            const T1 = element?.base_salary?.total_salary

            const numSlotWeekend = element?.bonus?.list_slot_weekend?.length
            const rateA3 = element.weekend_bonus
            const A3 = element?.bonus?.total_bonus_weekend

            const rateA4 = element.attendance_bonus
            const A4 = element?.bonus?.total_bonus_attendance

            const numConversion = element?.bonus?.list_conversion?.length
            const rateA5 = element.conversion_bonus
            const A5 = element?.bonus?.total_bonus_conversion

            const numReferral = element?.bonus?.list_referral?.length
            const rateA6 = element.referral_bonus
            const A6 = element?.bonus?.total_bonus_referral

            const numSubstitute =
                element?.bonus?.list_slot_substitute_class?.length
            const rateA7 = element.percent_substitute_bonus
            const A7 = element?.bonus?.total_bonus_substitute_class

            const T2 = element?.bonus?.total_bonus

            const numTrialPunish = element?.punish?.list_absent_trial?.length
            const rateA8 = element.percent_absent_punish_trial
            const A8 = element?.punish?.total_punish_absent_trial

            const numPremiumPunish =
                element?.punish?.list_absent_first_3_slot?.length
            const rateA9 = element.percent_absent_punish_first_3_slot
            const A9 = element?.punish?.total_punish_absent_first_3_slot

            const numWithoutLeave =
                element?.punish?.list_absent_without_leave?.length
            const rateA10 = element.percent_absent_punish
            const A10 = element?.punish?.total_punish_absent_without_leave

            const numWithLeave1 =
                element?.punish?.list_absent_with_leave_1h?.length
            const rateA11 = element.percent_absent_punish_1h
            const A11 = element?.punish?.total_punish_absent_with_leave_1h

            const numWithLeave2 =
                element?.punish?.list_absent_with_leave_2h?.length
            const rateA12 = element.percent_absent_punish_2h
            const A12 = element?.punish?.total_punish_absent_with_leave_2h

            const numWithLeave3 =
                element?.punish?.list_absent_with_leave_3h?.length
            const rateA13 = element.percent_absent_punish_3h
            const A13 = element?.punish?.total_punish_absent_with_leave_3h

            const numWithLeaveGreater3 =
                element?.punish?.list_absent_with_leave_greater_3h?.length
            const rateA14 = element.absent_punish_greater_3h
            const A14 =
                element?.punish?.total_punish_absent_with_leave_greater_3h

            const numOverLimit = element?.punish?.list_over_limit?.length
            const rateA15 = element.over_limit_punish
            const A15 = element?.punish?.total_punish_with_over_limit

            const numRegularPunish =
                element?.punish?.list_absent_regular_first_3_slot?.length
            const rateA16 = element.percent_absent_punish_first_3_slot
            const A16 =
                element?.punish?.total_punish_absent_regular_first_3_slot

            const numRegularWithLeave1 =
                element?.punish?.list_absent_regular_with_leave_1h?.length
            const rateA17 = element.percent_absent_punish_1h
            const A17 =
                element?.punish?.total_punish_absent_regular_with_leave_1h

            const numRegularWithLeave2 =
                element?.punish?.list_absent_regular_with_leave_2h?.length
            const rateA18 = element.percent_absent_punish_2h
            const A18 =
                element?.punish?.total_punish_absent_regular_with_leave_2h

            const numRegularWithLeave3 =
                element?.punish?.list_absent_regular_with_leave_3h?.length
            const rateA19 = element.percent_absent_punish_3h
            const A19 =
                element?.punish?.total_punish_absent_regular_with_leave_3h

            const numRegularWithLeaveGreater3 =
                element?.punish?.list_absent_regular_with_leave_greater_3h
                    ?.length
            const rateA20 = element.absent_punish_greater_3h
            const A20 =
                element?.punish
                    ?.total_punish_absent_regular_with_leave_greater_3h

            const numRegularWithOverLimit =
                element?.punish?.list_regular_over_limit?.length
            const rateA21 = element.over_limit_punish
            const A21 = element?.punish?.total_punish_regular_with_over_limit

            const numLateMemo = element?.punish?.list_late_memo?.length
            const rateA22 = element.late_memo_punish
            const A22 = element?.punish?.total_punish_with_late_memo

            const T3 = element?.punish?.total_punish

            const T = element.total_salary

            exportData.push([
                name,
                email,
                currency,
                salarySlot,
                numSlotDone,
                A1,
                numSlotStudentAbsent,
                rateA2,
                A2,
                T1,
                numSlotWeekend,
                rateA3,
                A3,
                rateA4,
                A4,
                numConversion,
                rateA5,
                A5,
                numReferral,
                rateA6,
                A6,
                numSubstitute,
                rateA7,
                A7,
                T2,
                numTrialPunish,
                rateA8,
                A8,
                numPremiumPunish,
                rateA9,
                A9,
                numWithoutLeave,
                rateA10,
                A10,
                numWithLeave1,
                rateA11,
                A11,
                numWithLeave2,
                rateA12,
                A12,
                numWithLeave3,
                rateA13,
                A13,
                numWithLeaveGreater3,
                rateA14,
                A14,
                numOverLimit,
                rateA15,
                A15,
                numRegularPunish,
                rateA16,
                A16,
                numRegularWithLeave1,
                rateA17,
                A17,
                numRegularWithLeave2,
                rateA18,
                A18,
                numRegularWithLeave3,
                rateA19,
                A19,
                numRegularWithLeaveGreater3,
                rateA20,
                A20,
                numRegularWithOverLimit,
                rateA21,
                A21,
                numLateMemo,
                rateA22,
                A22,

                T3,
                T
            ])
        })
        /* data: [["Col1", "Col2"], ["val1", "val2"]] */
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const exportExpireSoon = (nameFile: string, data: any) => {
    try {
        /* eslint-disable spaced-comment */
        // mã HV, fullname HV, username HV, loại HV, tên Khóa học, số buổi còn lại, ngày hết hạn, CS (username - fullname)
        const COLS_TO_EXPORT = [
            'Mã HV',
            'Tên HV',
            'Username HV',
            'Loại gói học',
            'Tên gói học',
            'Số buổi còn lại',
            'Ngày hết hạn',
            'CS(fullname - username)'
        ]
        const exportData = []
        data.forEach((element) => {
            exportData.push([
                element.id,
                element.name,
                element.username,
                element.package_type,
                element.package_name,
                element.number_class,
                element.exprire,
                element.cs
            ])
        })
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const exportAcademicRenewExcel = (
    nameFile: string,
    data: any,
    preMonth: any,
    time: any
) => {
    try {
        const COLS_TO_EXPORT = [
            'Mã GV',
            'Tên GV',
            `HV học trial tháng ${preMonth.month() + 1}`,
            `HV đăng ký sau học trial tháng ${preMonth.month() + 1}`,
            `Tỉ lệ tháng ${preMonth.month() + 1}`,
            `Tổng số lớp đã dạy (${preMonth
                .clone()
                .startOf('month')
                .format('DD/MM')} - ${time
                .clone()
                .endOf('month')
                .format('DD/MM')})`,
            `Tổng số lớp absent (${preMonth
                .clone()
                .startOf('month')
                .format('DD/MM')} - ${time
                .clone()
                .endOf('month')
                .format('DD/MM')})`
        ]
        const exportData = []
        data.forEach((record) => {
            exportData.push([
                record?.teacher?.id,
                record?.teacher?.full_name,
                record?.total_trial_student,
                record?.total_order_after_trial,
                record?.rate,
                record?.total_done,
                record?.total_absent
            ])
        })
        /* data: [["Col1", "Col2"], ["val1", "val2"]] */
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const exportToLessonStatisticsExcel = (
    nameFile: string,
    dataStatistic: any,
    cols: any,
    data: any
) => {
    /* convert state to workbook */
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([...dataStatistic, [...cols], ...data])
    const A4 = XLSX.utils.encode_cell({ r: 4, c: 1 })
    ws[A4].s = {
        font: {
            name: 'arial',
            sz: 30,
            bold: true,
            color: '#FF00FF'
        }
    }
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')

    const colNum = XLSX.utils.decode_col('M') // decode_col converts Excel col name to an integer for col #
    /* get worksheet range */
    // const range = XLSX.utils.decode_range(ws['!ref'])
    // for (let i = range.s.r + 1; i <= range.e.r; ++i) {
    //     /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
    //     const ref = XLSX.utils.encode_cell({ r: i, c: colNum })
    //     /* if the particular row did not contain data for the column, the cell will not be generated */
    //     if (!ws[ref]) continue
    //     /* `.t == "n"` for number cells */
    //     // if (ws[ref].t !== 'n') continue
    //     /* assign the `.z` number format */

    //     ws[ref].s = { alignment: { wrapText: true } }
    // }

    // XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${nameFile}.xlsx`)
}

export const exportTeacherList = async (nameFile: string, data: any) => {
    try {
        const COLS_TO_EXPORT = [
            'ID',
            'Name',
            'Username',
            'Phone',
            'Email',
            'Location',
            'Level',
            'Staff',
            'Status',
            'Bank name',
            'Account number',
            'Account name',
            'Paypal email'
        ]
        const exportData = []
        data.forEach((element: any, index: any) => {
            exportData.push([
                element.user_id,
                element.user?.full_name,
                element.user?.username,
                element.user_info?.phone_number,
                element.user_info?.email,
                element.location?.name,
                element.level?.name,
                element.staff?.fullname,
                element.user?.is_active === false ? 'inactive' : 'active',
                element.user_info?.bank_account?.bank_name ?? null,
                element.user_info?.bank_account?.account_number ?? null,
                element.user_info?.bank_account?.account_name ?? null,
                element.user_info?.bank_account?.paypal_email ?? null
            ])
        })
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        await XLSX.writeFile(wb, `${nameFile}.xlsx`)
        return
    } catch (error) {
        console.log(error)
    }
}

export const exportObservationList = async (nameFile: string, data: any) => {
    try {
        /* eslint-disable spaced-comment */
        const COLS_TO_EXPORT = [
            'STT',
            'Student name',
            'Username',
            'Package number class',
            'Lesson',
            'Created time',
            'Supporter',
            'GV đứng lớp',
            'Camera',
            'Đúng giờ',
            'Thái độ, sự hợp tác trong lớp học',
            'Sự tiến bộ theo đánh giá của CS'
        ]
        const exportData = []
        data.forEach((element: any, index: any) => {
            exportData.push([
                index + 1,
                element.user?.full_name,
                element.user?.username,
                element.orderedPackages?.original_number_class,
                element.lesson_index_in_course,
                moment(element.created_time).format('HH:mm DD/MM/YYYY'),
                element.student?.staff?.fullname,
                element.detail_data?.classroom_teacher?.content,
                element.detail_data?.camera?.content,
                element.detail_data?.on_time?.content,
                element.detail_data?.attitude_and_cooperation_in_the_classroom
                    ?.content,
                element.detail_data?.progress_according_to_reviews_of_cs
                    ?.content
            ])
        })
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        await XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}

export const handlerExportExcel = async (
    nameFile: string,
    data: any,
    colNum: any
) => {
    try {
        /* eslint-disable spaced-comment */
        const COLS_TO_EXPORT = colNum
        const exportData = data
        /* convert state to workbook */
        const ws = XLSX.utils.aoa_to_sheet([[...COLS_TO_EXPORT], ...exportData])
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
        /* generate XLSX file and send to client */
        await XLSX.writeFile(wb, `${nameFile}.xlsx`)
    } catch (error) {
        console.log(error)
    }
}
