$('#trainingImageModal').on('show.bs.modal', function (event) {

    const image = $(event.relatedTarget);
    const imageUrl = image.data('image');

    $('#trainingModalImage').attr('src', imageUrl);
});