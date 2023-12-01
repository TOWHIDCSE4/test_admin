export enum EnumAction {
    View = 'view',
    Create = 'create',
    Edit = 'edit',
    Delete = 'delete'
}

export enum EnumRole {
    Manager = 'manager',
    Deputy_manager = 'deputy_manager',
    Leader = 'leader',
    Staff = 'staff'
}

export enum PostStatus {
    'DRAFT',
    'PUBLIC'
}

export enum EnumParentTypeActionHistory {
    PERIODIC_REPORT = 1,
    BOOKING = 2
}
export enum EnumTypeActionHistory {
    PR_ADD_REPORT = 1,
    PR_ASSIGNED_ACADEMIC = 2,
    PR_CHANGE_REPORTER = 3,
    PR_UPDATE_STATUS = 4,
    PR_UPDATE_TYPE_REPORT = 5,
    PR_UPDATE_PRIORITY = 6,
    PR_UPDATE_LEVEL = 7,
    PR_SYNC_DATA = 8
}
