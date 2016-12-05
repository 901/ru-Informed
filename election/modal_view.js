$(document).ready(function() {
    $('#modal-background').click(function() {
        $('body').removeClass('modal--open');
        $('#modal-view').css({
            'display': 'none'
        });
    });
});
