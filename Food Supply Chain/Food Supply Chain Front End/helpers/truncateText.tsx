import React from 'react';

interface Props {
    text: string;
    maxLength: number;
}

export const TruncateText: React.FC<Props> = ({ text, maxLength }) => {
    if (text.length <= maxLength) {
        return <span>{text}</span>;
    }

    const truncatedText = text.substring(0, maxLength);
    return <span title={text}>{truncatedText}...</span>;
};