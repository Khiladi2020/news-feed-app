function getFormattedDate(dateString: string) {
    const date = new Date(dateString);

    // Extract hours, minutes, and seconds
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const ampm = hours >= 12 ? "PM" : "AM";

    // Format the time (adding leading zeros if necessary)
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${ampm}`;

    return formattedTime;
}

export { getFormattedDate };
