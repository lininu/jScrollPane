/*
    need to include jquery & jquery.mousewheel & jquery.jscrollpane
*/
;(function($) {
    $.fn.custScrollbar = function(option) {
        var navBar = $(this),
            navBarOptions = {
                showArrows: false,
                arrowDistance: null,
                animateScroll: true,
                custRoot: $(this),
                custNav: true,
                ignoreMobile: true, // it's not smoothly to scroll in mobile.
                ctReloadTime: 500,
                custArrowClassName: 'scrollbar__arrow',
                custArrowHideStatusClassName: 'hide',
                custScrollbarShowClassName: 'show',
                createArrow: function(that) {
                    if (!navBarOptions.custNav)
                        return;
                    $(that).find('.jspContainer').append('<div class="' + navBarOptions.custArrowClassName + '"><button class="' + navBarOptions.custArrowClassName + '-left"></button><button class="' + navBarOptions.custArrowClassName + '-right"></button></div>');
                },
                leftClick: null,
                rightClick: null,
                device: function() { return _detectDevice() },
                _isMobileStatus: false,
                mobileStatusPaneClassName: 'scroll__pane',
                scrollDistance : function (target, navBarOptions, multiplier) { return _scrollDistance(target, navBarOptions, multiplier); },
                scrollToEle: null
            };
        // Merge object2 into object1
        // $.extend( object1, object2 );
        $.extend(navBarOptions, option);
        // console.log(navBarOptions.device())

        if(!navBarOptions.ignoreMobile || navBarOptions.device() == 'mac' || navBarOptions.device() == 'pc') {
            navBar
                .bind('jsp-initialised', function(event, isScrollable) {

                    $.extend(navBarOptions, option);

                    if ($(this).find('.' + navBarOptions.custArrowClassName).length == 0) {
                        navBarOptions.createArrow(this);
                    }

                    if (isScrollable) {
                        $(this).find('.' + navBarOptions.custArrowClassName).fadeIn();
                    } else {
                        $(this).find('.' + navBarOptions.custArrowClassName).fadeOut();
                    }
                    $(this).trigger('jsp-scroll-x');
                })
                .jScrollPane(navBarOptions)
                .bind('jsp-scroll-x', function(event, scrollPositionX, isAtLeft, isAtRight) {
                    var arrowleft = $(this).find('.' + navBarOptions.custArrowClassName + '-left'),
                        arrowright = $(this).find('.' + navBarOptions.custArrowClassName + '-right');
                    var thisNavBarApi = $(this).data('jsp'),
                        thisNavBarXPercent = parseInt(thisNavBarApi.getPercentScrolledX() * 100);

                    if (isAtLeft || thisNavBarXPercent < 10)
                        $(arrowleft).addClass(navBarOptions.custArrowHideStatusClassName);
                    else
                        $(arrowleft).removeClass(navBarOptions.custArrowHideStatusClassName);

                    if (isAtRight || thisNavBarXPercent > 90)
                        $(arrowright).addClass(navBarOptions.custArrowHideStatusClassName);
                    else
                        $(arrowright).removeClass(navBarOptions.custArrowHideStatusClassName);

                    if ($(arrowleft).hasClass(navBarOptions.custArrowHideStatusClassName))
                        $(arrowleft).animate({
                            'left': $(arrowleft).outerWidth() * -1
                        }, 0);
                    else
                        $(arrowleft).animate({
                            'left': ''
                        }, 0);

                    if ($(arrowright).hasClass(navBarOptions.custArrowHideStatusClassName))
                        $(arrowright).animate({
                            'right': $(arrowright).outerWidth() * -1
                        }, 0);
                    else
                        $(arrowright).animate({
                            'right': ''
                        }, 0);
                })
                .mouseenter(function() {
                    $(this).find('.jspDrag').addClass(navBarOptions.custScrollbarShowClassName);
                })
                .mouseleave(function() {
                    // if($(this).hasClass('focused') == false)
                    $(this).find('.jspDrag').removeClass(navBarOptions.custScrollbarShowClassName);
                })
                .trigger('jsp-scroll-x');
            // .on('focus', function(){
            //   $(this).find('.jspDrag').addClass('show');
            //   $(this).addClass('focused');
            // })
            // .on('blur', function(){
            //   $(this).find('.jspDrag').removeClass('show');
            //   $(this).removeClass('focused');
            // });

            _resize(navBarOptions);

        } else {
            navBarOptions._isMobileStatus = true;
            navBar.addClass('scroll--mobile-status');
            navBar.wrapInner( "<div class='jspContainer'><div class='scroll__pane'></div></div>");
            navBarOptions.createArrow(navBar);
            _mobileScrollArrowShow(navBar, navBarOptions);
            _onMobileScroll(navBarOptions);
        }

        _clickEvent(navBarOptions);

        _scrollToEle(navBarOptions);

        return {
            scrollToEle : function(newSelector) { 
                navBarOptions.scrollToEle = newSelector;
                _scrollToEle(navBarOptions);
                return navBarOptions;
            }
        }
    };
    var _scrollCount = function(target, navBarOptions) {
        return navBarOptions.arrowDistance == null ? ($(target).closest(navBarOptions.custRoot).outerWidth() * .6) : navBarOptions.arrowDistance;
    }
    var _scrollDistance = function(target, navBarOptions, multiplier) {
        var tmpDistance = _scrollCount(target, navBarOptions);
        // console.log(navBarOptions._isMobileStatus)
        if(navBarOptions._isMobileStatus) {
            var tmpScrollLeft = tmpDistance * multiplier;

            if( tmpScrollLeft >= 0) {
                tmpScrollLeft = '+=' + tmpScrollLeft;
            } else {
                tmpScrollLeft = '-=' + (tmpScrollLeft * -1);
            }

            $(target).closest(navBarOptions.custRoot).find('.' + navBarOptions.mobileStatusPaneClassName)
                .animate({scrollLeft: tmpScrollLeft }, 1000, function() {
                    _mobileScrollArrowShow($(target).closest(navBarOptions.custRoot), navBarOptions);
                });
            
            return false;
        }
        var thisNavBarApi = $(target).closest(navBarOptions.custRoot).data('jsp');        
        
        thisNavBarApi.scrollByX(tmpDistance * multiplier);

        return false;
    };

    // ignoreMobile && _isMobileStatus
    var _mobileScrollArrowShow = function(target, options){
        var targetPane = target.find('.' + options.mobileStatusPaneClassName),
            arrowLeft = '.' + options.custArrowClassName + '-left',
            arrowRight = '.' + options.custArrowClassName + '-right';

        // console.log(targetPane[0].scrollWidth, $(targetPane).scrollLeft(), targetPane[0].clientWidth);
        if(targetPane[0] == undefined)
            return;

        var maxScroll = targetPane[0].scrollWidth - $(targetPane).scrollLeft() - targetPane[0].clientWidth;

        if ( 10 >= $(targetPane).scrollLeft()) {
            $(target).find(arrowLeft).animate({left: $(this).width() * -1}, 0);
        } else {
            $(target).find(arrowLeft).animate({left: '0'}, 0);
        }

        if ( 10 >= maxScroll) {
            $(target).find(arrowRight).animate({right: $(this).width() * -1}, 0);
        } else {
            $(target).find(arrowRight).animate({right: '0'}, 0);
        }
    }

    var _onMobileScroll = function(navBarOptions) {
        $('.' + navBarOptions.mobileStatusPaneClassName).on('scroll', function(e) {
            _mobileScrollArrowShow($(e.target).closest(navBarOptions.custRoot), navBarOptions);
        });
    }

    var _resize = function(navBarOptions) {
        var navBarApi = navBarOptions.custRoot.data('jsp');
        var navBarApiResizeTimer;
        $(window).on('resize', function() {
            clearTimeout(navBarApiResizeTimer);
            setTimeout(function() {
                navBarOptions.custRoot.each(function(i, e) {
                    var _that = $(this).data('jsp');
                    _that.reinitialise();
                });
            }, navBarOptions.ctReloadTime);
        });
    };

    var _isFunction = function(obj) {
        var getType = {};
        return obj && getType.toString.call(obj) === '[object Function]';
    };

    var _detectDevice = function() {
        if (/ipad/i.test(navigator.userAgent.toLowerCase())) {
            return "ipad"; // 目前是用ipad瀏覽
        }
        else if (/iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())) {
            return "mobile"; // 目前是用手機瀏覽
        }
        else if (/macintosh/i.test(navigator.userAgent.toLowerCase())) {
            return "mac"; // 目前是用mac瀏覽
        }
        else {
            return "pc"; // 目前是用電腦瀏覽
        }
    };

    var _clickEvent = function(navBarOptions) {

        navBarOptions.custRoot.find('.' + navBarOptions.custArrowClassName + '-left').bind('click', function(){ 
            if(!_isFunction(navBarOptions.leftClick))
                _scrollDistance(this, navBarOptions, -1);
            else 
                navBarOptions.leftClick(this, navBarOptions);

        });
        navBarOptions.custRoot.find('.' + navBarOptions.custArrowClassName + '-right').bind('click', function(){
            if(!_isFunction(navBarOptions.rightClick))
                _scrollDistance(this, navBarOptions, 1);
            else 
                navBarOptions.rightClick(this, navBarOptions);
        });
    }

    var _scrollToEle = function(navBarOptions) {
        if(navBarOptions.scrollToEle == null)
            return;
        else {
            var targetPane;
            if(navBarOptions._isMobileStatus) {
                $(navBarOptions.custRoot).each(function(i, e){
                    $(e).find('.' + navBarOptions.mobileStatusPaneClassName)
                        .animate( {'scrollLeft' : $(e).find(navBarOptions.scrollToEle).position().left }, 750 );
                });
            } else {
                $(navBarOptions.custRoot).each(function(i, e){
                    $(e).data('jsp').scrollToElement($(e).find(navBarOptions.scrollToEle));
                });
            }
        }
    }
})(jQuery);