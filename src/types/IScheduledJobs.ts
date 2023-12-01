export enum ScheduledJobsStatus {
    STARTED = 1,
    STOPPED = 2
}

export interface IScheduledJobs {
    _id: string
    status: ScheduledJobsStatus
    scheduled_time: string
    description: string
}
