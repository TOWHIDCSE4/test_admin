export const ADMIN_FEATURE = {
    GOI_SAN_PHAM: 1,
    PHONG_BAN: 2,
    QUOC_TICH: 3,
    NGUOI_DUNG: 14,
    NHOM: 15
}

export const PERMISSIONS = {
    // Teaching Management
    tm: 'tm',
    // Teaching Management - Overview
    tmo: 'tmo',
    tmo_view: 'tmo_view',
    tmo_view_detail: 'tmo_view_detail',
    tmo_watch_video: 'tmo_watch_video',
    tmo_update_status: 'tmo_update_status',
    tmo_update_unit: 'tmo_update_unit',
    tmo_update_time: 'tmo_update_time',
    tmo_update_note: 'tmo_update_note',
    tmo_join_meeting: 'tmo_join_meeting',
    tmo_add_link_hmp: 'tmo_add_link_hmp',
    tmo_toggle_lock_unit: 'tmo_toggle_lock_unit',
    // Teaching Management - Create standard class
    tmcsc: 'tmcsc',
    tmcsc_view: 'tmcsc_view',
    tmcsc_create: 'tmcsc_create',
    // Teaching Management - Create trial class
    tmctc: 'tmctc',
    tmctc_view: 'tmctc_view',
    tmctc_create: 'tmctc_create',
    // Teaching Management - Create ielts class
    tmcic: 'tmcic',
    tmcic_view: 'tmcic_view',
    tmcic_create: 'tmcic_create',
    // Teaching Management - Memo management
    tmmm: 'tmmm',
    tmmm_view: 'tmmm_view',
    tmmm_update: 'tmmm_update',
    tmmm_best_memo: 'tmmm_best_memo',
    tmmm_create_memo_ai: 'tmmm_create_memo_ai',
    // Teaching Management - Exam history
    tmeh: 'tmeh',
    tmeh_view: 'tmeh_view',
    tmeh_view_detail: 'tmeh_view_detail',
    // Teaching Management - Homework history
    tmhh: 'tmhh',
    tmhh_view: 'tmhh_view',
    tmhh_view_detail: 'tmhh_view_detail',
    // Teaching Management - Class Video
    tmcv: 'tmcv',
    tmcv_view: 'tmcv_view',
    // Teaching Management - Reservation requests
    tmrr: 'tmrr',
    tmrr_view: 'tmrr_view',
    tmrr_create: 'tmrr_create',
    tmrr_delete: 'tmrr_delete',
    tmrr_save_pdf: 'tmrr_save_pdf',
    tmrr_approve: 'tmrr_approve',
    tmrr_reject: 'tmrr_reject',
    tmrr_mark_paid: 'tmrr_mark_paid',
    // Teaching Management - Extension requests
    tmer: 'tmer',
    tmer_view: 'tmer_view',
    tmer_create: 'tmer_create',
    tmer_approve: 'tmer_approve',
    tmer_reject: 'tmer_reject',
    tmer_create_pro: 'tmer_create_pro',

    // Automatic Scheduling
    as: 'as',
    // Automatic Scheduling - Automatic Scheduling Management
    asasm: 'asasm',
    asasm_view: 'asasm_view',
    asasm_update: 'asasm_update',
    asasm_delete: 'asasm_delete',
    asasm_clone: 'asasm_clone',
    // Automatic Scheduling - Create Automatic Scheduling
    ascas: 'ascas',
    ascas_view: 'ascas_view',
    ascas_create: 'ascas_create',
    // Automatic Scheduling - merge package
    asmp: 'asmp',
    asmp_view: 'asmp_view',
    asmp_create: 'asmp_create',
    asmp_delete: 'asmp_delete',

    // Teachers
    t: 't',
    // Teachers - All teacher
    tat: 'tat',
    tat_view: 'tat_view',
    tat_create: 'tat_create',
    tat_export_excel: 'tat_export_excel',
    tat_update: 'tat_update',
    tat_edit_regular: 'tat_edit_regular',
    tat_admin_view: 'tat_admin_view',
    // Teachers - Teacher schedule
    tts2: 'tts2',
    tts2_view: 'tts2_view',
    // Teachers - Trial Pool
    ttp: 'ttp',
    ttp_view: 'ttp_view',
    ttp_create: 'ttp_create',
    ttp_update: 'ttp_update',
    ttp_delete: 'ttp_delete',
    // Teachers - Teacher Salary
    tts: 'tts',
    tts_view: 'tts_view',
    tts_caculate: 'tts_caculate',
    tts_export_excel: 'tts_export_excel',
    tts_mark_paid: 'tts_mark_paid',
    // Teachers - Upgrade Request
    tur: 'tur',
    tur_view: 'tur_view',
    tur_create: 'tur_create',
    tur_update: 'tur_update',
    // Teachers - Teacher Referral
    ttr: 'ttr',
    ttr_view: 'ttr_view',
    // Teachers - Pending Register
    tpr: 'tpr',
    tpr_view: 'tpr_view',
    tpr_approve: 'tpr_approve',
    tpr_reject: 'tpr_reject',
    // Teachers - Regular Request
    trr: 'trr',
    trr_view: 'trr_view',
    trr_approve: 'trr_approve',
    trr_reject: 'trr_reject',
    // Teachers - Leave/Absent Request
    tlr: 'tlr',
    tlr_view: 'tlr_view',
    tlr_update: 'tlr_update',

    // Students
    s: 's',
    // Students - Regular Students
    srs: 'srs',
    srs_view: 'srs_view',
    srs_create: 'srs_create',
    srs_update: 'srs_update',
    srs_edit_regular: 'srs_edit_regular',
    srs_send_email: 'srs_send_email',
    srs_admin_view: 'srs_admin_view',
    // Students - Trial Students
    sts: 'sts',
    sts_view: 'sts_view',
    // Students - All Students
    sas: 'sas',
    sas_view: 'sas_view',
    sas_create: 'sas_create',
    sas_update: 'sas_update',
    sas_edit_regular: 'sas_edit_regular',
    sas_admin_view: 'sas_admin_view',
    sas_add_link_skype: 'sas_add_link_skype',
    // Students - Expire Soon
    ses: 'ses',
    ses_view: 'ses_view',
    // Students - Course Analytics
    sca: 'sca',
    sca_view: 'sca_view',
    // Students - Monthly Analytics
    sma: 'sma',
    sma_view: 'sma_view',
    // Students - Students Wallet
    ssw: 'ssw',
    ssw_view: 'ssw_view',
    ssw_view_detail: 'ssw_view_detail',

    // Students - Leave Request
    slr: 'slr',
    slr_view: 'slr_view',
    slr_create: 'slr_create',
    slr_delete: 'slr_delete',
    slr_screen_config: 'slr_screen_config',

    // AI reports
    air: 'air',
    // AI reports - Report Generate
    airrg: 'airrg',
    airrg_view: 'airrg_view',
    airrg_create: 'airrg_create',

    // AI reports - Report Results
    airrr: 'airrr',
    airrr_view: 'airrr_view',
    airrr_create: 'airrr_create',
    airrr_update: 'airrr_update',
    airrr_delete: 'airrr_delete',

    // Customer Support Management
    csm: 'csm',
    // Customer Support Management - Dashboard
    csmd: 'csmd',
    csmd_view: 'csmd_view',
    // Customer Support Management - Student Management
    csmsm: 'csmsm',
    csmsm_view: 'csmsm_view',
    csmsm_update: 'csmsm_update',
    csmsm_export_excel: 'csmsm_export_excel',
    csmsm_update_supporter: 'csmsm_update_supporter',
    csmsm_export_student_list: 'csmsm_export_student_list',

    // Customer Support Management - Claim Recommendations
    csmcr: 'csmcr',
    csmcr_view: 'csmcr_view',
    csmcr_update: 'csmcr_update',
    csmcr_create: 'csmcr_create',
    csmcr_export_excel: 'csmcr_export_excel',
    // Customer Support Management - Regular Calendar Status
    csmrcs: 'csmrcs',
    csmrcs_view: 'csmrcs_view',
    csmrcs_create_booking: 'csmrcs_create_booking',
    // Customer Support Management - Lesson statistics
    csmls: 'csmls',
    csmls_view: 'csmls_view',
    csmls_export_excel: 'csmls_export_excel',

    // Regular Care
    rc: 'rc',
    // Regular Care - Dashboard
    rcd: 'rcd',
    rcd_view: 'rcd_view',
    // Regular Care - Greeting Call
    rcgc: 'rcgc',
    rcgc_view: 'rcgc_view',
    rcgc_update: 'rcgc_update',
    // Regular Care - Checking Call
    rccc: 'rccc',
    rccc_view: 'rccc_view',
    rccc_update: 'rccc_update',
    // Regular Care - Observation
    rco: 'rco',
    rco_view: 'rco_view',
    rco_update: 'rco_update',
    rco_delete: 'rco_delete',
    rco_export: 'rco_export',
    // Regular Care - Upcoming Test
    rcut: 'rcut',
    rcut_view: 'rcut_view',
    rcut_update: 'rcut_update',
    // Regular Care - Regular Test
    rcrt: 'rcrt',
    rcrt_view: 'rcrt_view',
    rcrt_update: 'rcrt_update',
    // Regular Care - Test Reports
    rctr: 'rctr',
    rctr_view: 'rctr_view',
    rctr_update: 'rctr_update',

    // Regular Care - Period Reports
    rcpr: 'rcpr',
    rcpr_view: 'rcpr_view',
    rcpr_update: 'rcpr_update',
    rcpr_delete: 'rcpr_delete',
    rcpr_assign_manager: 'rcpr_assign_manager',
    rcpr_assign_academic: 'rcpr_assign_academic',
    rcpr_add_report: 'rcpr_add_report',

    // Sale Management
    sm: 'sm',
    // Sale Management - Trial Booking
    smtb: 'smtb',
    smtb_view: 'smtb_view',
    smtb_export_excel: 'smtb_export_excel',

    // Academic Management
    am: 'am',
    // Academic Management - Claim Recommendations
    amcr: 'amcr',
    amcr_view: 'amcr_view',
    amcr_update: 'amcr_update',
    // Academic Management - Trial Booking
    amtb: 'amtb',
    amtb_view: 'amtb_view',
    amtb_export_excel: 'amtb_export_excel',
    // Trial Test - Library test management
    amltm: 'amltm',
    amltm_view: 'amltm_view',
    amltm_edit: 'amltm_edit',

    // Academic Management - Trial Test Ielts Result
    amttir: 'amttir',
    amttir_view: 'amttir_view',
    amttir_edit: 'amttir_edit',

    // Advice Letter
    al: 'al',
    // Advice Letter - All Advice Letter
    alaal_view: 'alaal_view',
    alaal_create: 'alaal_create',
    alaal_edit: 'alaal_edit',
    alaal_delete: 'alaal_delete',
    alaal_change_status: 'alaal_change_status',

    // Wallet Management
    wm: 'wm',
    // Wallet Management - Deposit Management
    wmdm: 'wmdm',
    wmdm_view: 'wmdm_view',
    wmdm_approve: 'wmdm_approve',
    wmdm_reject: 'wmdm_reject',

    // Order Management
    om: 'om',
    // Order Management - All Orders
    omao: 'omao',
    omao_view: 'omao_view',
    omao_update: 'omao_update',
    omao_create_trial: 'omao_create_trial',
    // delete order package
    omao_op_delete: 'omao_op_delete',
    omao_op_stop: 'omao_op_stop',
    // Order Management - Pre Orders
    ompo: 'ompo',
    ompo_view: 'ompo_view',
    ompo_update: 'ompo_update',
    ompo_create_order: 'ompo_create_order',
    ompo_approve: 'ompo_approve',
    ompo_reject: 'ompo_reject',
    ompo_remove: 'ompo_remove',

    // Package Management
    pm: 'pm',
    // Package Management - Packages
    pmp: 'pmp',
    pmp_view: 'pmp_view',
    pmp_create: 'pmp_create',
    pmp_update: 'pmp_update',
    pmp_delete: 'pmp_delete',
    // Package Management - Curriculums
    pmc: 'pmc',
    pmc_view: 'pmc_view',
    pmc_create: 'pmc_create',
    pmc_update: 'pmc_update',
    pmc_delete: 'pmc_delete',
    // Package Management - Courses
    pmc2: 'pmc2',
    pmc2_view: 'pmc2_view',
    pmc2_create: 'pmc2_create',
    pmc2_update: 'pmc2_update',
    pmc2_delete: 'pmc2_delete',
    // Package Management - Units
    pmu: 'pmu',
    pmu_view: 'pmu_view',
    pmu_create: 'pmu_create',
    pmu_update: 'pmu_update',
    pmu_delete: 'pmu_delete',
    // Package Management - Subject
    pms: 'pms',
    pms_view: 'pms_view',
    pms_create: 'pms_create',
    pms_update: 'pms_update',
    pms_delete: 'pms_delete',

    // Quiz Management
    qm: 'qm',
    // Quiz Management - Quiz Management
    qmqm: 'qmqm',
    qmqm_view: 'qmqm_view',
    qmqm_create: 'qmqm_create',
    qmqm_update: 'qmqm_update',
    qmqm_add_question: 'qmqm_add_question',
    // Quiz Management - Question Management
    qmqm2: 'qmqm2',
    qmqm2_view: 'qmqm2_view',
    qmqm2_create: 'qmqm2_create',
    qmqm2_update: 'qmqm2_update',
    // Quiz Management - History
    qmh: 'qmh',
    qmh_view: 'qmh_view',

    // Self-Study V2
    ssv2: 'ssv2',
    // Self-Study V2 - History
    ssv2h: 'ssv2h',
    ssv2h_view: 'ssv2h_view',

    // CMS
    cms: 'cms',
    // CMS - Page Management
    cmsp: 'cmsp',
    cmsp_view: 'cmsp_view',
    cmsp_create: 'cmsp_create',
    cmsp_update: 'cmsp_update',
    cmsp_delete: 'cmsp_delete',
    // CMS - Post
    cmsp2: 'cmsp2',
    cmsp2_view: 'cmsp2_view',
    cmsp2_create: 'cmsp2_create',
    cmsp2_update: 'cmsp2_update',
    cmsp2_delete: 'cmsp2_delete',
    // CMS - Category
    cmsc: 'cmsc',
    cmsc_view: 'cmsc_view',
    cmsc_create: 'cmsc_create',
    cmsc_update: 'cmsc_update',
    cmsc_delete: 'cmsc_delete',
    // CMS - Tag
    cmst: 'cmst',
    cmst_view: 'cmst_view',
    cmst_create: 'cmst_create',
    cmst_update: 'cmst_update',
    cmst_delete: 'cmst_delete',

    // Marketing
    m: 'm',
    // Marketing - Email Marketing
    mem: 'mem',
    mem_view: 'mem_view',
    mem_send_email: 'mem_send_email',
    // Marketing - Email Template
    met: 'met',
    met_view: 'met_view',
    met_create: 'met_create',
    met_update: 'met_update',
    met_delete: 'met_delete',
    // Marketing - Coupons
    mc: 'mc',
    mc_view: 'mc_view',
    mc_create: 'mc_create',
    mc_update: 'mc_update',
    mc_delete: 'mc_delete',
    // Marketing - Marketing Inbox
    mmi: 'mmi',
    mmi_view: 'mmi_view',

    // Ticket
    t2: 't2',
    // Ticket - Student Class Report
    t2scr: 't2scr',
    t2scr_view: 't2scr_view',
    t2scr_update: 't2scr_update',

    // Customer Support Report
    csr: 'csr',
    // Customer Support Report - New Student Report
    csrnsr: 'csrnsr',
    csrnsr_view: 'crnsr_view',
    // Customer Support Report - Attendence Report
    csrar: 'csrar',
    csrar_view: 'csrar_view',
    // Customer Support Report - Claim
    csrc: 'csrc',
    csrc_view: 'csrc_view',
    // Customer Support Report - Test Report
    csrtr: 'csrtr',
    csrtr_view: 'csrtr_view',
    // Customer Support Report - Birthday Report
    csrbr: 'csrbr',
    csrbr_view: 'csrbr_view',
    // Customer Support Report - 'Number Class Report
    csrncr: 'csrncr',
    csrncr_view: 'csrncr_view',
    csrncr_export_excel: 'csrncr_export_excel',
    // Customer Support Report - renew
    csrrn: 'csrrn',
    csrrn_view: 'csrrn_view',
    csrrn_caculate: 'csrrn_caculate',
    // Customer Support Report - List Expired Student Not Renew
    csrles: 'csrles',
    csrles_view: 'csrles_view',
    csrles_export_excel: 'csrles_export_excel',

    // Academic Report
    ar: 'ar',
    // Academic Report - Teacher Report
    artr: 'artr',
    artr_view: 'artr_view',
    // Academic Report - Schedule Report
    arsr: 'arsr',
    arsr_view: 'arsr_view',
    // Academic Report - Class Report
    arcr: 'arcr',
    arcr_view: 'arcr_view',
    // Academic Report - Trial Report
    artr2: 'artr2',
    artr2_view: 'artr2_view',
    // Academic Report - Leave Report
    arlr: 'arlr',
    arlr_view: 'arlr_view',
    // Academic Report - Performance Report
    arpr2: ' arpr2',
    arpr2_view: 'arpr2_view',
    // Academic Report - Renew
    arrn: ' arpr2',
    arrn_view: 'arrn_view',
    arrn_export_excel: 'arrn_export_excel',
    // Academic Report - Learning Assessment Report
    arla: 'arla',
    arla_view: 'arla_view',
    arla_create: 'arla_create',
    arla_update: 'arla_update',
    arla_update_note: 'arla_update_note',
    arla_update_status: 'arla_update_status',
    arla_delete: 'arla_delete',

    // HR Report
    hrr: 'hrr',
    // HR Report - Trial Proportion
    hrrtp: ' hrrtp',
    hrrtp_view: 'hrrtp_view',
    // Zalo Report - Zalo Interact
    zlrzi: ' zlrzi',
    zlrzi_view: 'zlrzi_view',
    // HRM
    hrm: 'hrm',
    // HRM - User Management
    hrmum: 'hrmum',
    hrmum_view: 'hrmum_view',
    hrmum_create: 'hrmum_create',
    hrmum_update: 'hrmum_update',
    hrmum_delete: 'hrmum_delete',
    // HRM - Role Management
    hrmrm: 'hrmrm',
    hrmrm_view: 'hrmrm_view',
    hrmrm_create: 'hrmrm_create',
    hrmrm_update: 'hrmrm_update',
    hrmrm_delete: 'hrmrm_delete',
    // HRM - Team Management
    hrmtm: 'hrmtm',
    hrmtm_view: 'hrmtm_view',
    hrmtm_create: 'hrmtm_create',
    hrmtm_update: 'hrmtm_update',
    hrmtm_delete: 'hrmtm_delete',

    // System Admin
    sa: 'sa',
    // System Admin- Template AI - API Key Management
    taakm: 'taakm',
    taakm_view: 'taakm_view',
    taakm_update: 'taakm_update',
    taakm_create: 'taakm_create',
    taakm_delete: 'taakm_delete',
    // System Admin- Template AI - Prompt Category Management
    tapcm: 'tapcm',
    tapcm_view: 'tapcm_view',
    tapcm_update: 'tapcm_update',
    tapcm_create: 'tapcm_create',
    tapcm_delete: 'tapcm_delete',
    // System Admin - Template AI - Prompt Template Management
    taptm: 'taptm',
    taptm_view: 'taptm_view',
    taptm_update: 'taptm_update',
    taptm_create: 'taptm_create',
    taptm_delete: 'taptm_delete',
    // System Admin - Logs
    sal: 'sal',
    sal_view: 'sal_view',
    // System Admin - Comment Suggestion
    sacs: 'sacs',
    sacs_view: 'sacs_view',
    sacs_create: 'sacs_create',
    sacs_update: 'sacs_update',
    sacs_delete: 'sacs_delete',
    // System Admin - Teacher Level
    satl: 'satl',
    satl_view: 'satl_view',
    satl_create: 'satl_create',
    satl_update: 'satl_update',
    satl_delete: 'satl_delete',
    // System Admin - Student Level
    sasl: 'sasl',
    sasl_view: 'sasl_view',
    sasl_create: 'sasl_create',
    sasl_update: 'sasl_update',
    sasl_delete: 'sasl_delete',
    // System Admin - Teacher Location
    satl2: 'satl2',
    satl2_view: 'satl2_view',
    satl2_create: 'satl2_create',
    satl2_update: 'satl2_update',
    // System Admin - Event Notice
    saen: 'saen',
    saen_view: 'saen_view',
    saen_create: 'saen_create',
    saen_update: 'saen_update',
    saen_delete: 'saen_delete',
    // System Admin - Cron Jobs
    sacr: 'sacr',
    sacr_view: 'sacr_view'
}
