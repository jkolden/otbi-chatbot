
module.exports = {

 dateFormatter: function(dateString, timeString = "133000") {


    let year = dateString.substring(0,4);
    let month = dateString.substring(4,6);
    let day = dateString.substring(6,8);

    let hrs = timeString.substring(0,2);
    let min = timeString.substring(2,4);


    let d = new Date(year, month - 1, day, hrs, min);

    return d;

},

getSum: function (total, num) {
            return total + num;
        }
}