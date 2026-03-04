import { SetMetadata } from "@nestjs/common";

export const SKIP_AUTH_KEY = 'skipAuth';
export const skipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);