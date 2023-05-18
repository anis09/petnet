export class GetSessionsByPlatformResDto {
    success: boolean;
    result: [
        {
            platform: string;
            count: number;
            percentage: number;
        }
    ];
}

export class GetSessionsByDeviceCategoryResDto {
    success: boolean;
    result: [
        {
            item: string;
            count: number;
            lastMonth: number;
        }
    ];
}

export class GetSessionsByRegionResDto {
    success: boolean;
    result: [
        {
            region: string;
            count: number;
        }
    ];
}

export class GetSessionsByLast7DaysResDto {
    success: boolean;
    labels: string[];
    series: [
        {
            name: string;
            type: string;
            fill: string;
            data: number[];
        }
    ];
}

export class GetSessionsByDefaultChannelGroupResDto {
    success: boolean;
    result: [
        {
            item: string;
            count: number;
        }
    ];
}

export class GetSessionsByOperatingSystemResDto {
    success: boolean;
    result: [
        {
            os: string;
            count: number;
        }
    ];
}

export class GetSessionsByDeviceBrandResDto {
    success: boolean;
    result: [
        {
            brand: string;
            count: number;
        }
    ];
}