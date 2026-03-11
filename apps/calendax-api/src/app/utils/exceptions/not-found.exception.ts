import { NotFoundException } from "./common.exceptions"

export const leadNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Lead Not Found");
    }
}

export const patientNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Patient Not Found");
    }
}

export const userNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("User Not Found");
    }
}

export const permissionNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Permission Not Found");
    }
}

export const roleNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Role Not Found");
    }
}

export const siteNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Site Not Found");
    }
}

export const permissionGroupNotFound = (param) => {
    if(!param) {
        throw new NotFoundException("Permission Group Not Found");
    }
}