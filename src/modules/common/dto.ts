export type FetchAllResponse = {
    data: object[];
    totalPages: number;
    totalCount: number;
    currentPage: number;
}

export interface SuccessResponse<T> {
    message: string;
    statusCode: number;
    data: T;
}
