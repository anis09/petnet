import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GetSessionsByDefaultChannelGroupResDto, GetSessionsByDeviceBrandResDto, GetSessionsByDeviceCategoryResDto, GetSessionsByLast7DaysResDto, GetSessionsByOperatingSystemResDto, GetSessionsByPlatformResDto, GetSessionsByRegionResDto } from "../dtos/ga.dto";
import { vars } from "../constants/vars";

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: vars.googleAnalyticsClientEmail,
        private_key: vars.googleAnalyticsPrivateKey.replace(/\n/gm, "\n"),
    },
});

class GoogleAnalyticsService {
    public async getSessionsByPlatform(): Promise<GetSessionsByPlatformResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "platform",
                }
            ],
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [
            {
                platform: 'Android',
                count: 0,
                percentage: 0
            },
            {
                platform: 'iOS',
                count: 0,
                percentage: 0
            },
            {
                platform: 'Browser',
                count: parseInt(response[0]?.rows[0]?.metricValues[0]?.value),
                percentage: 100
            }
        ]

        return {
            success: true,
            result,
        }
    }

    public async getSessionsByDeviceCategory(): Promise<GetSessionsByDeviceCategoryResDto> {
        const [resultFor30Days, resultFor60Days] = await Promise.all([
            analyticsDataClient.runReport({
                property: `properties/${vars.googleAnalyticsPropertyId}`,
                dateRanges: [
                    {
                        startDate: '30daysAgo',
                        endDate: 'today',
                    },
                ],
                dimensions: [
                    {
                        name: "deviceCategory",
                    }
                ],
                metrics: [
                    {
                        name: 'sessions',
                    },
                ]
            }),
            analyticsDataClient.runReport({
                property: `properties/${vars.googleAnalyticsPropertyId}`,
                dateRanges: [
                    {
                        startDate: '60daysAgo',
                        endDate: 'today',
                    },
                ],
                dimensions: [
                    {
                        name: "deviceCategory",
                    }
                ],
                metrics: [
                    {
                        name: 'sessions',
                    },
                ]
            })
        ]);

        let result60Days: any = [];
        for (const item of resultFor60Days[0].rows) {
            result60Days.push({
                item: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }

        let result30Days: any = [];
        for (const item of resultFor30Days[0].rows) {
            const obj = result60Days.find(el => el.item == item.dimensionValues[0].value);
            const diff: number = parseInt(item.metricValues[0].value) - (obj.count - parseInt(item.metricValues[0].value));
            const percentage: number = parseFloat((diff / parseInt(item.metricValues[0].value) * 100).toFixed(1));
            result30Days.push({
                item: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value),
                lastMonth: percentage
            });
        }

        return {
            success: true,
            result: result30Days
        }
    }

    public async getSessionsByRegion(): Promise<GetSessionsByRegionResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "region",
                },
            ],
            dimensionFilter: {
                filter: {
                    fieldName: "country",
                    stringFilter: {
                        value: "Australia",
                        matchType: "EXACT"
                    }
                }
            },
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [];
        for (const item of response[0].rows) {
            result.push({
                region: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }

        return {
            success: true,
            result,
        }
    }

    public async getSessionsByLast7Days(): Promise<GetSessionsByLast7DaysResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '7daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "date",
                },
            ],
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [];
        for (const item of response[0].rows) {
            result.push({
                date: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }
        result.sort((a, b) => a.date - b.date);

        let labels: any = [];
        let data: any = [];
        for (const item of result) {
            labels.push(item.date);
            data.push(item.count);
        }

        return {
            success: true,
            labels,
            series: [
                {
                    name: 'Visits',
                    type: 'column',
                    fill: 'solid',
                    data,
                }
            ]
        }
    }

    public async getSessionsByDefaultChannelGroup(): Promise<GetSessionsByDefaultChannelGroupResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "sessionDefaultChannelGroup",
                },
            ],
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [];
        for (const item of response[0].rows) {
            result.push({
                item: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }

        return {
            success: true,
            result,
        }
    }

    public async getSessionsByOperatingSystem(): Promise<GetSessionsByOperatingSystemResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "operatingSystem",
                },
            ],
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [];
        for (const item of response[0].rows) {
            result.push({
                os: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }

        return {
            success: true,
            result,
        }
    }

    public async getSessionsByDeviceBrand(): Promise<GetSessionsByDeviceBrandResDto> {
        const response = await analyticsDataClient.runReport({
            property: `properties/${vars.googleAnalyticsPropertyId}`,
            dateRanges: [
                {
                    startDate: '30daysAgo',
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: "mobileDeviceBranding",
                },
            ],
            metrics: [
                {
                    name: 'sessions',
                },
            ]
        });

        let result: any = [];
        for (const item of response[0].rows) {
            result.push({
                brand: item.dimensionValues[0].value,
                count: parseInt(item.metricValues[0].value)
            });
        }

        return {
            success: true,
            result,
        }
    }
}

export default GoogleAnalyticsService;
