var predictions = {
    offset: 0,
    backward: function () {
        this.offset -= 5;
        this.updateOffsetHtml();
    },
    forward: function () {
        this.offset += 5;
        this.updateOffsetHtml();
    },
    moreBackward: function () {
        this.offset -= 30;
        this.updateOffsetHtml();
    },
    moreForward: function () {
        this.offset += 30;
        this.updateOffsetHtml();
    },
    reset: function () {
        this.offset = 0;
        this.updateOffsetHtml();
    },
    updateOffsetHtml: function () {
        $('#rp_predictedOffset').html(this.offset);
    }
};

$(document).on('change', '#rp_optionspredicted', function(this: any) {
    $('#rp_predictedSettings').toggle(this.checked);
    predictions.reset();
});

// @ts-expect-error TS(2591): Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = predictions;
