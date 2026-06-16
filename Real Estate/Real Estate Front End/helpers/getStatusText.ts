import { PropertyStatus, PropertyStatusText } from "@/enums/property.enum";


export const getStatusText = (status: PropertyStatus): string => {
    switch (status) {
        case PropertyStatus.NOT_FOR_SALE:
            return PropertyStatusText.NOT_FOR_SALE;
        case PropertyStatus.FOR_SALE:
            return PropertyStatusText.FOR_SALE;
        case PropertyStatus.TOKEN_PAID:
            return PropertyStatusText.TOKEN_PAID;
        case PropertyStatus.TOKEN_APPROVED:
            return PropertyStatusText.TOKEN_APPROVED;
        case PropertyStatus.LEGAL_APPROVED:
            return PropertyStatusText.LEGAL_APPROVED;
        case PropertyStatus.LEGAL_DISAPPROVED:
            return PropertyStatusText.LEGAL_DISAPPROVED;
        case PropertyStatus.AGREEMENT_DONE:
            return PropertyStatusText.AGREEMENT_DONE;
        case PropertyStatus.SOLD:
            return PropertyStatusText.SOLD;
        default:
            return "";
    }
};
