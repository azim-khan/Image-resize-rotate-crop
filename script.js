var canvas_img = new function () {
    var canvas = $('#face_canvas')[0],
        ctx = canvas.getContext("2d"),
        fileName = '';
    
    function draw(img) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    }

    function crop(left, top, width, height) {
        var copyCanvas = $('<canvas width="' + width + '" height="' + height + '"></canvas>')[0];
        var copyCtx = copyCanvas.getContext("2d");
        
        var imageData = ctx.getImageData(left, top, width, height);
        
        copyCtx.putImageData(imageData, 0, 0);
        
        var img = new Image();
        img.onload = function() {
            draw(this);
        };
        img.src = copyCanvas.toDataURL();
        
        $('.panel').removeAttr('style');
        $('#isCrop').prop('checked', false);
    }
    
    function resize(width, height, img) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
    }

    var imgWidth, imgHeight, imgToRotate;

    function rotate(ang) {
        var img = new Image();
        img.onload = function () {
            imgWidth = this.width;
            imgHeight = this.height;
            imgToRotate = this;

            var size = newSize(this.width, this.height, ang);
            drawRotate(size, ang);
        };
        img.src = canvas.toDataURL();
    }
    
    function newSize(w, h, a) {
        var size = {};
        
        var rads = a * Math.PI / 180;
        var c = Math.cos(rads);
        var s = Math.sin(rads);
        if (s < 0) {
            s = -s;
        }
        if (c < 0) {
            c = -c;
        }
        size.width = h * s + w * c;
        size.height = h * c + w * s;

        return size;
    }

    function drawRotate(size, ang) {
        canvas.width = size.width;
        canvas.height = size.height;

        var cx = canvas.width / 2;
        var cy = canvas.height / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(cx, cy);
        ctx.rotate(ang * Math.PI / 180);
        ctx.drawImage(imgToRotate, -imgWidth / 2, -imgHeight / 2);
    }
    
    $('#sizeBox').change(function() {
        if (this.value == 'custom') {
            $('#measurement').show();
        } else {
            $('#measurement').hide();
        }
    });

    $('#changeSize').click(function () {
        var size = $('#sizeBox').val();
        if (size == '') return;

        if (size == 'custom') {
            var width = $('#width').val();
            var height = $('#height').val();
            
            var img = new Image();
            img.onload = function () {
                resize(width, height, this);
            };
            img.src = canvas.toDataURL();
        } else {
            
            var img = new Image();
            img.onload = function () {
                resize(this.width * size / 100, this.height / 100 * size, this);
            };
            img.src = canvas.toDataURL();
        }
    });

    $('#isCrop').change(function() {
        if (this.checked) {
            $('.panel').show();
        } else {
            $('.panel').hide();
        }
    });

    $('#download').click(function () {
        this.href = canvas.toDataURL();
        this.download = fileName;
    });

    $('#crop').click(function () {
        if (!$('#isCrop').is(':checked')) return;

        var left = $('.panel').position().left;
        var top = $('.panel').position().top;
        var width = $('.panel').width();
        var height = $('.panel').height();

        crop(left, top, width, height);
    });

    $('#cw').click(function() {
        rotate(90);
    });
    
    $('#ccw').click(function () {
        rotate(-90);
    });

    $('#facePhoto').change(function () {
        var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'jpe', 'bmp'];
        if (fileExtension.indexOf($(this).val().split('.').pop().toLowerCase()) == -1) {
            $(this).val('');
            alert("Only formats are allowed : " + fileExtension.join(', '));
            return;
        }

        var file, _URL = window.URL || window.webkitURL;

        if (file = this.files[0]) {
            fileName = this.files[0].name.trim() ? 'rez_' + this.files[0].name : 'rez_image.png';
            var img = new Image();
            img.onload = function () {
                draw(this);
            };
            img.src = _URL.createObjectURL(file);
        }
    });

    $('#restoreOriginal').click(function() {
        $('#facePhoto').change();
    });

    $('.draggable-handler').mousedown(function(e) {
        var drag = $(this).closest('.draggable');
        drag.addClass('dragging');

        var extra = $('.container').offset();
        var left = extra.left - $(document).scrollLeft();
        var top = extra.top - $(document).scrollTop();
        
        drag.css('left', e.clientX - left - $(this).width() / 2);
        drag.css('top', e.clientY - top - $(this).height() / 2);
        
        $(this).on('mousemove', function (e) {
            if (drag.position().left < 0) {
                drag.css({ 'left': 0 });
                return;
            }
            if (drag.position().top < 0) {
                drag.css({ 'top': 0 });
                return;
            }

            drag.css('left', e.clientX - left - $(this).width() / 2);
            drag.css('top', e.clientY - top - $(this).height() / 2);
            window.getSelection().removeAllRanges();
        });
    });

    $('.draggable-handler').mouseleave(stopDragging);
    $('.draggable-handler').mouseup(stopDragging);

    function stopDragging() {
        var drag = $(this).closest('.draggable');
        drag.removeClass('dragging');
        $(this).off('mousemove');
        
        if (drag.position().left < 0) {
            drag.css({ 'left': 0 });
            return;
        }
        if (drag.position().top < 0) {
            drag.css({ 'top': 0 });
            return;
        }
    }
}