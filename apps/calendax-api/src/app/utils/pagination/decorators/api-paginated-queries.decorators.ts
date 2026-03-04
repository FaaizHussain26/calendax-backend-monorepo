import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

type QueryOption = {
    name: string;
    type: any;
    required: boolean;
    description: string;
    example?: any;
    enum?: any;
    isArray?: boolean;
};

export function ApiPaginationQueries(customOptions: Array<QueryOption>) {

    const predefinedOptions = [
        {
            name: 'skip',
            type: Number,
            required: false,
            description: 'Number of records to skip (for pagination)',
            example: 0,
        },
        {
            name: 'limit',
            type: Number,
            required: false,
            description: 'Number of records to fetch per page',
            example: 10,
        },
         {
            name: 'page',
            type: Number,
            required: false,
            description: 'Number of page',
            example: 1,
        },
        {
            name: 'order',
            type: String,
            required: false,
            description: 'Sort by {`field`: `ASC`} field (ASC or DESC)',
            example: { 'id': 'DESC' },
        },
        {
            name: 'search[searchText]',
            type: String,
            required: false,
            description: 'Text to search for in specified fields',
        },
        {
            name: 'search[searchFields]',
            type: [String],
            required: false,
            description: 'Fields to apply the search on',
            example: [],
            isArray: true,
        },
    ];

    // Merge predefined options with custom options
    const options: QueryOption[] = [...predefinedOptions, ...customOptions];

    return applyDecorators(
        ...options.map(option =>
            ApiQuery({
                name: option.name,
                type: option.type,
                required: option.required,
                description: option.description,
                example: option.example || undefined,
                enum: option.enum || undefined,
                isArray: option.isArray || false,
            }),
        ),
    );
}