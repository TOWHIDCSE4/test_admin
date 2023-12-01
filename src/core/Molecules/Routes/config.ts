import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'
import { flatStructure } from 'utils/data-structure'

export const treeConfig = [
    {
        route: '/dashboard',
        isAuthenticated: true,
        title: 'Dashboard',
        icon: 'chart-line',
        component: () => import('pages/Dashboard')
    },
    {
        route: '#nm',
        isAuthenticated: true,
        title: 'Notifications',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            {
                route: '/nm/notifications',
                title: 'Notifications',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () =>
                    import('pages/NotificationManagement/Notifications')
            }
        ]
    },
    {
        route: '#teaching',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Teaching Management',
        icon: 'list',
        children: [
            {
                route: '/teaching/overview',
                required: PERMISSIONS.tmo_view,
                title: 'Overview',
                isAuthenticated: true,
                component: () => import('pages/TeachingManagement/Overview')
            },
            {
                route: '/teaching/create-class',
                required: PERMISSIONS.tmcsc_view,
                title: 'Create Standard Class',
                isAuthenticated: true,
                component: () =>
                    import('pages/TeachingManagement/CreateStandardClass')
            },
            {
                route: '/teaching/create-trial',
                required: PERMISSIONS.tmctc_view,
                title: 'Create Trial Class',
                isAuthenticated: true,

                component: () =>
                    import('pages/TeachingManagement/CreateTrialClass')
            },
            {
                route: '/teaching/create-ielts-class',
                required: PERMISSIONS.tmcic_view,
                title: 'Create Ielts Class',
                isAuthenticated: true,

                component: () =>
                    import('pages/TeachingManagement/CreateIeltsClass')
            },
            {
                route: '/teaching/memo',
                required: PERMISSIONS.tmmm_view,
                title: 'Memo Management',
                isAuthenticated: true,

                component: () =>
                    import('pages/TeachingManagement/MemoManagement')
            },
            {
                route: '/teaching/exam',
                required: PERMISSIONS.tmeh_view,
                title: 'Exam History',
                isAuthenticated: true,
                component: () => import('pages/TeachingManagement/Exams')
            },
            // {
            //     route: '/teaching/homework',
            //     required: PERMISSIONS.tmhh_view,
            //     title: 'Homework History',
            //     isAuthenticated: true,

            //     component: () => import('pages/TeachingManagement/Homeworks')
            // },
            {
                route: '/quiz-history',
                title: 'Self-Study-V1 History',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.qmh_view,
                component: () => import('pages/Quiz/QuizHistory')
            },
            {
                route: '/self-study-v2-history',
                title: 'Self-Study V2 History',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.ssv2h_view,
                component: () => import('pages/SelfStudyV2/SelfStudyV2History')
            },
            {
                route: '/teaching/class-videos',
                required: PERMISSIONS.tmcv_view,
                title: 'Class Videos',
                isAuthenticated: true,

                component: () => import('pages/TeachingManagement/ClassVideos')
            },
            {
                route: '/teaching/reservation-request',
                required: PERMISSIONS.tmrr_view,
                title: 'Reservation Requests',
                isAuthenticated: true,

                component: () =>
                    import('pages/TeachingManagement/ReservationRequest')
            },
            {
                route: '/teaching/extension-request',
                required: PERMISSIONS.tmer_view,
                title: 'Extension Requests',
                isAuthenticated: true,

                component: () =>
                    import('pages/TeachingManagement/ExtensionRequest')
            }
        ]
    },
    {
        route: '#scheduling',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Automatic Scheduling',
        icon: 'calendar',
        children: [
            {
                route: '/automatic-scheduling/all',
                required: PERMISSIONS.asasm_view,
                title: 'All Scheduling',
                isAuthenticated: true,
                component: () =>
                    import('pages/AutomaticScheduling/AllScheduling')
            },
            {
                route: '/automatic-scheduling/create',
                title: 'Create Scheduling',
                isAuthenticated: true,
                required: PERMISSIONS.ascas_view,
                component: () =>
                    import('pages/AutomaticScheduling/CreateScheduling')
            },
            {
                route: '/automatic-scheduling/merge-package',
                title: 'Merge package',
                isAuthenticated: true,
                required: PERMISSIONS.ascas_view,
                component: () =>
                    import('pages/AutomaticScheduling/MergePackage')
            }
        ]
    },
    {
        route: '#teachers',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Teachers',
        icon: 'chalkboard-teacher',
        children: [
            {
                route: '/teachers/all',
                title: 'All Teachers',
                isAuthenticated: true,
                statistic: 'all_teacher_count',
                required: PERMISSIONS.tat_view,
                component: () => import('pages/Teachers/AllTeachers')
            },
            {
                route: '/teachers/schedule',
                title: 'Teacher schedules',
                isAuthenticated: true,
                required: PERMISSIONS.tts2_view,
                component: () => import('pages/Teachers/TeacherSchedules')
            },
            {
                route: '/teachers/trial-pool',
                title: 'Trial Pool',
                isAuthenticated: true,
                statistic: 'trial_teacher_count',
                required: PERMISSIONS.ttp_view,
                component: () => import('pages/Teachers/TeacherTrialPool')
            },
            {
                route: '/teachers/salary',
                title: 'Teacher Salary',
                isAuthenticated: true,
                required: PERMISSIONS.tts_view,
                component: () => import('pages/Teachers/TeacherSalary')
            },

            {
                route: '/teachers/referrals',
                title: 'Teacher Referrals',
                isAuthenticated: true,
                statistic: 'referral_teacher_count',
                required: PERMISSIONS.ttr_view,
                component: () => import('pages/Teachers/TeacherReferrals')
            },
            {
                route: '/teachers/pending',
                title: 'Pending Register',
                isAuthenticated: true,
                statistic: 'pending_teacher_count',
                required: PERMISSIONS.tpr_view,
                component: () => import('pages/Teachers/PendingRegister')
            },
            {
                route: '/teachers/regular-request',
                title: 'Regular Request',
                isAuthenticated: true,
                statistic: 'pending_regular_request_count',
                required: PERMISSIONS.trr_view,
                component: () => import('pages/Teachers/RegularRequest')
            },
            {
                route: '/teachers/absent-request',
                title: 'Leave/Absent Request',
                isAuthenticated: true,
                statistic: 'pending_absent_request_count',
                required: PERMISSIONS.tlr_view,
                component: () => import('pages/Teachers/AbsentRequest')
            }
        ]
    },
    {
        route: '#students',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Students',
        icon: 'user-graduate',
        children: [
            {
                route: '/students/all',
                title: 'All Students',
                isAuthenticated: true,
                statistic: 'active_student_count',
                required: PERMISSIONS.sas_view,
                component: () => import('pages/Students/All')
            },
            {
                route: '/students/regular',
                title: 'Regular Students',
                isAuthenticated: true,
                statistic: 'regular_student_count',
                required: PERMISSIONS.srs_view,
                component: () => import('pages/Students/RegularStudent')
            },
            {
                route: '/students/trial',
                title: 'Trialed Students',
                isAuthenticated: true,
                statistic: 'trial_student_count',
                required: PERMISSIONS.sts_view,
                component: () => import('pages/Students/TrialStudent')
            },
            {
                route: '#students-analytics',
                title: 'Students Analytics',
                isAuthenticated: true,
                required: 'PARENT',
                icon: 'book-open',
                children: [
                    {
                        route: '/student/analytics/course',
                        title: 'Course Analytics',
                        isAuthenticated: true,
                        required: PERMISSIONS.sca_view,
                        component: () =>
                            import('pages/Students/Analytics/course')
                    },
                    {
                        route: '/student/analytics/month',
                        title: 'Monthly Analytics',
                        isAuthenticated: true,
                        required: PERMISSIONS.sma_view,
                        component: () =>
                            import('pages/Students/Analytics/monthly')
                    }
                ]
            },
            {
                route: '/students/wallet',
                title: "Student's Wallet",
                isAuthenticated: true,
                required: PERMISSIONS.ssw_view,
                component: () => import('pages/Students/Wallet')
            },
            {
                route: '/students/leave-request',
                title: 'Leave Request',
                isAuthenticated: true,
                required: PERMISSIONS.slr_view,
                component: () => import('pages/Students/LeaveRequest')
            }
        ]
    },
    {
        route: '#csm',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Customer Support Management',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            // {
            //     route: '/csm/dashboard',
            //     title: 'Dashboard',
            //     isAuthenticated: true,
            //     headerColor: '#f3f3f4',
            //     hasBorderBottom: true,
            //     required: PERMISSIONS.csmd_view,
            //     component: () =>
            //         import('pages/CustomerSupportManagement/Dashboard')
            // },
            {
                route: '/csm/students-management',
                title: 'Students Management',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.csmsm_view,
                component: () =>
                    import('pages/CustomerSupportManagement/StudentsManagement')
            },
            {
                route: '/csm/claim-recommentations',
                title: 'Claim Recommentations',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.csmcr_view,
                component: () =>
                    import(
                        'pages/CustomerSupportManagement/ClaimRecommentations'
                    )
            },
            {
                route: '/csm/auto-schedule-failed',
                title: 'Regular Calendar Status',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.csmrcs_view,
                component: () =>
                    import(
                        'pages/CustomerSupportManagement/RegularCalendarStatus'
                    )
            },
            {
                route: '/csm/lesson-statistics',
                title: 'Lesson Statistics',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.csmls_view,
                component: () =>
                    import('pages/CustomerSupportManagement/LessonStatistics')
            }
        ]
    },
    {
        route: '#air',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'AI Reports',
        icon: 'user-friends',
        children: [
            {
                route: '/air/report-generate',
                title: 'Report Generate',
                isAuthenticated: true,
                required: PERMISSIONS.airrg_view,
                component: () => import('pages/AIReports/ReportGenerate')
            },
            {
                route: '/air/report-results',
                title: 'Report Result',
                isAuthenticated: true,
                required: PERMISSIONS.airrr_view,
                component: () => import('pages/AIReports/ReportResults')
            }
        ]
    },
    {
        route: '#rc',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Regular Care',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            {
                route: '/rc/dashboard',
                title: 'Dashboard',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rcd_view,
                component: () => import('pages/RegularCare/Dashboard')
            },
            {
                route: '/rc/greeting-call',
                title: 'Greeting Call',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rcgc_view,
                component: () => import('pages/RegularCare/GreetingCall')
            },
            {
                route: '/rc/checking-call',
                title: 'Checking Call',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rccc_view,
                component: () => import('pages/RegularCare/CheckingCall')
            },
            {
                route: '/rc/observe',
                title: 'Observation List',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rco_view,
                component: () => import('pages/RegularCare/Observation')
            },
            {
                route: '/rc/upcoming-test',
                title: 'Upcoming Test',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rcut_view,
                component: () => import('pages/RegularCare/UpcomingTest')
            },
            {
                route: '/rc/regular-test',
                title: 'Regular Test',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rcrt_view,
                component: () => import('pages/RegularCare/RegularTest')
            },
            {
                route: '/rc/test-reports',
                title: 'Test Reports',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rctr_view,
                component: () => import('pages/RegularCare/TestReports')
            },
            {
                route: '/rc/periodic-reports',
                title: 'Periodic Reports',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.rcpr_view,
                component: () => import('pages/RegularCare/PeriodicReports')
            }
        ]
    },
    {
        route: '#sale',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Sale Management',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            {
                route: '/sale-management/trial-booking',
                required: PERMISSIONS.smtb_view,
                title: 'Trial Booking',
                isAuthenticated: true,
                component: () => import('pages/SaleManagement/TrialBooking')
            }
        ]
    },
    {
        route: '#am',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Academic Management',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            {
                route: '/am/claim-recommentations',
                title: 'Claim Recommentations',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.amcr_view,
                component: () =>
                    import('pages/AcademicManagement/ClaimRecommentations')
            },
            {
                route: '/am/trial-booking',
                required: PERMISSIONS.amtb_view,
                title: 'Trial Booking',
                isAuthenticated: true,
                component: () => import('pages/AcademicManagement/TrialBooking')
            },
            {
                route: '/am/library-test',
                required: PERMISSIONS.amltm_view,
                title: 'Library Test',
                isAuthenticated: true,
                component: () => import('pages/AcademicManagement/TrialTest')
            },
            {
                route: '/am/test-result-report',
                required: PERMISSIONS.amtb_view,
                title: 'Test Result Report',
                isAuthenticated: true,
                component: () =>
                    import('pages/AcademicManagement/TestResultReport')
            },
            {
                route: '/am/trial-test-ielts-result',
                required: PERMISSIONS.amttir_view,
                title: 'Trial Test Ielts Result',
                isAuthenticated: true,
                component: () =>
                    import('pages/AcademicManagement/TrialTestIeltsResult')
            }
        ]
    },
    {
        route: '#al',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Advice Letter',
        icon: 'user-friends',
        headerColor: 'white',
        children: [
            {
                route: '/al/all-advice-letter',
                title: 'All advice letter',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.alaal_view,
                component: () => import('pages/AdviceLetter/AllAdviceLetter')
            }
        ]
    },
    {
        route: '#wallet',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Wallet Management',
        icon: 'dollar',
        headerColor: 'white',
        children: [
            {
                route: '/wallet/deposit-management',
                title: 'Deposit Management',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                required: PERMISSIONS.wmdm_view,
                component: () =>
                    import('pages/WalletManagement/DepositManagement')
            }
        ]
    },
    {
        route: '#orders',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Orders Management',
        icon: 'cart-plus',
        children: [
            {
                route: '/all-orders',
                title: 'All Orders',
                statistic: 'pending_order_count',
                isAuthenticated: true,
                required: PERMISSIONS.omao_view,
                component: () => import('pages/Orders/AllOrders')
            },
            {
                route: '/pre-orders',
                title: 'Pre Orders',
                isAuthenticated: true,
                required: PERMISSIONS.ompo_view,
                component: () => import('pages/Orders/PreOders')
            }
        ]
    },
    {
        route: '#courses',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Courses',
        icon: 'book-open',
        children: [
            {
                route: '#private-courses',
                required: 'PARENT',
                isAuthenticated: true,
                title: 'Private courses',
                icon: 'book-open',
                children: [
                    {
                        route: '/courses/packages',
                        title: 'Packages',
                        isAuthenticated: true,
                        required: PERMISSIONS.pmp_view,
                        component: () =>
                            import('pages/Courses/PrivateCourses/Package')
                    },
                    {
                        route: '/courses/curriculums',
                        title: 'Curriculums',
                        isAuthenticated: true,
                        required: PERMISSIONS.pmc_view,
                        component: () =>
                            import('pages/Courses/PrivateCourses/Curriculum')
                    },
                    {
                        route: '/courses/courses',
                        title: 'Courses',
                        isAuthenticated: true,
                        required: PERMISSIONS.pmc2_view,
                        component: () =>
                            import('pages/Courses/PrivateCourses/Course')
                    },
                    {
                        route: '/courses/units',
                        title: 'Units',
                        isAuthenticated: true,
                        required: PERMISSIONS.pmu_view,
                        component: () =>
                            import('pages/Courses/PrivateCourses/Unit')
                    },
                    {
                        route: '/courses/subjects',
                        title: 'Subjects',
                        isAuthenticated: true,
                        required: PERMISSIONS.pms_view,
                        component: () =>
                            import('pages/Courses/PrivateCourses/Subject')
                    }
                ]
            }
        ]
    },
    {
        route: '#quiz',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Quiz Library',
        icon: 'book-reader',
        children: [
            {
                route: '/quiz',
                title: 'Quiz',
                isAuthenticated: true,
                required: PERMISSIONS.qmqm_view,
                component: () => import('pages/Quiz/Quiz')
            },
            {
                route: '/question',
                title: 'Questions',
                isAuthenticated: true,
                required: PERMISSIONS.qmqm2_view,
                component: () => import('pages/Quiz/Question')
            }
        ]
    },
    {
        route: '#cms',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'CMS',
        icon: 'book',
        children: [
            {
                route: '/cms/page',
                title: 'Page',
                isAuthenticated: true,
                required: PERMISSIONS.cmsp_view,
                component: () => import('pages/CMS/Page')
            },
            {
                route: '/cms/post',
                title: 'Post',
                isAuthenticated: true,
                required: PERMISSIONS.cmsp2_view,
                component: () => import('pages/CMS/Post')
            },
            {
                route: '/cms/category',
                title: 'Category',
                isAuthenticated: true,
                required: PERMISSIONS.cmsc_view,
                component: () => import('pages/CMS/Category')
            },
            {
                route: '/cms/tag',
                title: 'Tag',
                isAuthenticated: true,
                required: PERMISSIONS.cmst_view,
                component: () => import('pages/CMS/Tag')
            }
        ]
    },
    {
        route: '#marketing',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Marketing',
        icon: 'globe-asia',
        children: [
            {
                route: '/marketing/send-email-marketing',
                title: 'Send Email Marketing',
                isAuthenticated: true,
                required: PERMISSIONS.mem_view,
                component: () => import('pages/Marketing/SendEmailMarketing')
            },
            {
                route: '/marketing/email-template',
                title: 'Email Template',
                isAuthenticated: true,
                required: PERMISSIONS.met_view,
                component: () => import('pages/SystemConfig/Template')
            },
            {
                route: '/marketing/coupons',
                title: 'Coupons',
                isAuthenticated: true,
                required: PERMISSIONS.mc_view,
                component: () => import('pages/Marketing/Coupon')
            },
            {
                route: '/marketing/contacts',
                title: 'Marketing Inbox Data',
                isAuthenticated: true,
                statistic: 'pending_marketing_inbox_count',
                required: PERMISSIONS.mmi_view,
                component: () => import('pages/Marketing/MarketingInboxData')
            }
        ]
    },
    {
        route: '#tickets',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Tickets',
        icon: 'ticket-alt',
        children: [
            {
                route: '/tickets/reports',
                title: 'Student Class Reports',
                isAuthenticated: true,
                required: PERMISSIONS.t2scr_view,
                component: () => import('pages/Tickets/Reports')
            }
        ]
    },
    {
        route: '#cs-report',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Báo Cáo CSKH',
        icon: 'info',
        children: [
            {
                route: '/cs-report/renew',
                title: 'BC Tái ký',
                isAuthenticated: true,
                required: PERMISSIONS.csrrn_view,
                component: () => import('pages/CustomerSupportReport/Renew')
            },
            {
                route: '/cs-report/new-student',
                title: 'BC HV mới',
                isAuthenticated: true,
                required: PERMISSIONS.csrnsr_view,
                component: () =>
                    import('pages/CustomerSupportReport/NewStudent')
            },
            {
                route: '/cs-report/attendance',
                title: 'BC điểm chuyên cần',
                isAuthenticated: true,
                required: PERMISSIONS.csrar_view,
                component: () =>
                    import('pages/CustomerSupportReport/Attendance')
            },
            {
                route: '/cs-report/testing-report',
                title: 'BC bài kiểm tra',
                isAuthenticated: true,
                required: PERMISSIONS.csrtr_view,
                component: () => import('pages/CustomerSupportReport/Exam')
            },
            {
                route: '/cs-report/claim-recommendations',
                title: 'BC Claim & Recommendations',
                isAuthenticated: true,
                required: PERMISSIONS.csrc_view,
                component: () =>
                    import('pages/CustomerSupportReport/ClaimRecommendation')
            },
            {
                route: '/cs-report/birthday',
                title: 'BC sinh nhật',
                isAuthenticated: true,
                required: PERMISSIONS.csrbr_view,
                component: () => import('pages/CustomerSupportReport/Birthday')
            },
            {
                route: '/cs-report/expire-soon',
                title: 'BC học viên hết hạn',
                isAuthenticated: true,
                required: PERMISSIONS.csrncr_view,
                component: () =>
                    import('pages/CustomerSupportReport/ExpireSoon')
            },
            {
                route: '/cs-report/expire-soon2',
                title: 'BC học viên sắp hết số buổi',
                isAuthenticated: true,
                required: PERMISSIONS.csrncr_view,
                component: () =>
                    import('pages/CustomerSupportReport/ExpireSoon2')
            },
            {
                route: '/cs-report/expired-student-not-renew',
                title: 'DS học viên hết hạn không renew',
                isAuthenticated: true,
                required: PERMISSIONS.csrles_view,
                component: () =>
                    import('pages/CustomerSupportReport/ExpiredStudentNotRenew')
            }
        ]
    },
    {
        route: '#academic-report',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Báo Cáo Học Thuật',
        icon: 'info',
        children: [
            {
                route: '/academic-report/renew',
                title: 'BC Renew',
                isAuthenticated: true,
                required: PERMISSIONS.arrn_view,
                component: () => import('pages/AcademicReport/Renew')
            },
            {
                route: '/academic-report/list-teachers',
                title: 'BC danh sách GV',
                isAuthenticated: true,
                required: PERMISSIONS.artr_view,
                component: () => import('pages/AcademicReport/ListTeacher')
            },
            {
                route: '/academic-report/schedule-slots',
                title: 'BC Schedule',
                isAuthenticated: true,
                required: PERMISSIONS.arsr_view,
                component: () => import('pages/AcademicReport/ScheduleSlots')
            },
            {
                route: '/academic-report/status-class',
                title: 'BC trạng thái lớp học',
                isAuthenticated: true,
                required: PERMISSIONS.arcr_view,
                component: () => import('pages/AcademicReport/StatusClass')
            },
            {
                route: '/academic-report/trial',
                title: 'BC Trial',
                isAuthenticated: true,
                required: PERMISSIONS.artr2_view,
                component: () => import('pages/AcademicReport/TrialPool')
            },
            {
                route: '/academic-report/teaching-quality',
                title: 'BC chất lượng giảng dạy',
                isAuthenticated: true,
                required: PERMISSIONS.arpr2_view,
                component: () => import('pages/AcademicReport/TeachingQuality')
            },
            {
                route: '/academic-report/on-leave',
                title: 'BC nghỉ phép',
                isAuthenticated: true,
                required: PERMISSIONS.arlr_view,
                component: () => import('pages/AcademicReport/OnLeave')
            },
            {
                route: '/academic-report/learning-assessment',
                title: 'BC kết quả học tập',
                isAuthenticated: true,
                required: PERMISSIONS.arla_view,
                component: () =>
                    import('pages/AcademicReport/LearningAssessment')
            }
        ]
    },
    {
        route: '#hr-report',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Báo Cáo Trial',
        icon: 'info',
        children: [
            {
                route: '/hr-report/trial-proportion',
                title: 'BC tỷ lệ trial',
                isAuthenticated: true,
                required: PERMISSIONS.hrrtp_view,
                component: () => import('pages/HrReport/trialProportion')
            }
        ]
    },
    {
        route: '#zalo-report',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'Báo Cáo Zalo',
        icon: 'info',
        children: [
            {
                route: '/zalo-report/zalo-interactive',
                title: 'BC tương tác Zalo',
                isAuthenticated: true,
                required: PERMISSIONS.zlrzi_view,
                component: () => import('pages/ZaloReport/ZaloInteraction')
            }
        ]
    },
    {
        route: '#hrm',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'HRM',
        icon: 'user-friends',
        children: [
            {
                route: '/hrm/user-management',
                title: 'Quản lý người dùng',
                isAuthenticated: true,
                required: PERMISSIONS.hrmum_view,
                component: () => import('pages/HRM/UserManagement')
            },
            {
                route: '/hrm/role-department',
                title: 'Phân quyền người dùng',
                isAuthenticated: true,
                required: PERMISSIONS.hrmrm_view,
                component: () =>
                    import('pages/Category/Department/DepartmentManagement')
            },
            {
                route: '/hrm/team-management',
                title: 'Quản lý nhóm',
                isAuthenticated: true,
                required: PERMISSIONS.hrmtm_view,
                component: () => import('pages/Category/Department/Team')
            }
        ]
    },
    {
        route: '#system-admin',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'System Admin',
        icon: 'cogs',
        children: [
            {
                route: '#template-ai',
                required: 'PARENT',
                isAuthenticated: true,
                title: 'AI Template',
                icon: 'book-open',
                children: [
                    {
                        route: '/template-ai/api-key-management',
                        title: 'Api Keys',
                        isAuthenticated: true,
                        headerColor: '#f3f3f4',
                        hasBorderBottom: true,
                        required: PERMISSIONS.taakm_view,
                        component: () =>
                            import('pages/TemplateAI/ApiKeyManagement')
                    },
                    {
                        route: '/template-ai/prompt-category-management',
                        title: 'Prompt Categories',
                        isAuthenticated: true,
                        required: PERMISSIONS.tapcm_view,
                        component: () =>
                            import('pages/TemplateAI/PromptCategoryManagement')
                    },
                    {
                        route: '/template-ai/prompt-template-management',
                        required: PERMISSIONS.taptm_view,
                        title: 'Prompt Templates',
                        isAuthenticated: true,
                        component: () =>
                            import('pages/TemplateAI/PromptTemplateManagement')
                    }
                ]
            },
            {
                route: '/system-admin/logs',
                title: 'Logs Management',
                isAuthenticated: true,
                required: PERMISSIONS.sal_view,
                component: () => import('pages/SystemConfig/Logs')
            },
            {
                route: '/system-admin/comment-suggestion',
                title: 'Comment Suggestion',
                isAuthenticated: true,
                required: PERMISSIONS.sacs_view,
                component: () => import('pages/SystemConfig/CommentSuggestion')
            },
            {
                route: '/system-admin/teacher-level',
                title: 'Teacher Level',
                isAuthenticated: true,
                required: PERMISSIONS.satl_view,
                component: () => import('pages/SystemConfig/TeacherLevel')
            },
            {
                route: '/students/level',
                title: 'Student Level',
                isAuthenticated: true,
                required: PERMISSIONS.sasl_view,
                component: () => import('pages/Students/Level')
            },

            {
                route: '/system-admin/teacher-location',
                title: "Teacher's Location",
                isAuthenticated: true,
                required: PERMISSIONS.satl2_view,
                component: () => import('pages/SystemConfig/Location')
            },
            {
                route: '/system-admin/event-notice',
                title: 'Event notice',
                isAuthenticated: true,
                required: PERMISSIONS.saen_view,
                component: () => import('pages/SystemConfig/EventNotice')
            },
            {
                route: '/system-admin/cron-jobs',
                title: 'Cron Jobs',
                isAuthenticated: true,
                required: PERMISSIONS.sacr_view,
                component: () => import('pages/SystemConfig/CronJobs')
            }
        ]
    }
]

export const routeWithoutSidebar = [
    {
        route: '/',
        isAuthenticated: true,
        component: () => import('pages/Dashboard')
    },
    {
        route: '/cms/page/:pageId',
        title: 'Cron Jobs',
        isAuthenticated: true,
        component: () => import('pages/CMS/Editor')
    },
    {
        route: '/teachers/salary-detail',
        title: 'Teacher Salary Detail',
        isAuthenticated: true,
        required: PERMISSIONS.tts_view,
        component: () =>
            import('pages/Teachers/TeacherSalary/TeacherSalaryDetail')
    }
]

export function filterConfigByPerms(_treeConfig = [], perms = []) {
    const config = []
    _.forEach(_treeConfig, (c) => {
        if (c.required !== 'PARENT') {
            const childByPerms = _.find(perms, (p) => p === c.required)
            if (childByPerms) {
                config.push(c)
            }
        } else if (
            c.required === 'PARENT' &&
            c.children &&
            c.children.length > 0
        ) {
            const childConfig = filterConfigByPerms(c.children, perms)
            if (childConfig.length > 0) {
                c.children = childConfig
                config.push(c)
            }
        } else if (!c.required) {
            config.push(c)
        }
    })
    return config
}

export default treeConfig

export const flatConfig = flatStructure(treeConfig)
