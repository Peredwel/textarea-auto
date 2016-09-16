angular.module('smartArea', [])
        .directive('smartArea', function($compile) {
return {
   restrict: 'A',
   scope: {
       areaConfig: '=smartArea',
       areaData: '=ngModel'
   },
   replace: true,
   link: function(scope, textArea){
       if(textArea[0].tagName.toLowerCase() !== 'textarea'){
           console.warn("smartArea can only be used on textareas");
           return false;
       }

       var properties = [
           'direction',
           'boxSizing',
           'width',
           'overflowX',
           'overflowY',
           'color',
           'height',

           'borderTopWidth',
           'borderRightWidth',
           'borderBottomWidth',
           'borderLeftWidth',

           'borderTopColor',
           'borderRightColor',
           'borderBottomColor',
           'borderLeftColor',

           'borderTopStyle',
           'borderRightStyle',
           'borderBottomStyle',
           'borderLeftStyle',
           'borderRadius',
           'backgroundColor',

           'paddingTop',
           'paddingRight',
           'paddingBottom',
           'paddingLeft',
           'fontStyle',
           'fontVariant',
           'fontWeight',
           'fontStretch',
           'fontSize',
           'fontSizeAdjust',
           'lineHeight',
           'fontFamily',

           'textAlign',
           'textTransform',
           'textIndent',
           'textDecoration',

           'letterSpacing',
           'wordSpacing',
           'whiteSpace',
           'wordBreak',
           'wordWrap'
       ];

       // Build the HTML structure
       var mainWrap = angular.element('<div class="sa-wrapper"></div>');

       scope.fakeAreaElement = angular.element($compile('<div class="sa-fakeArea" ng-trim="false" ng-bind-html="fakeArea"></div>')(scope))
               .appendTo(mainWrap);

       scope.dropdown.element = angular.element($compile('<div class="sa-dropdown" ng-show="dropdown.content.length > 0"><input type="text" class="form-control" ng-model="dropdown.filter" ng-show="dropdown.showFilter"/><ul class="dropdown-menu" role="menu" style="position:static"><li ng-repeat="element in dropdown.content | filter:dropdown.filter" role="presentation"><a href="" role="menuitem" ng-click="dropdown.selected(element)" ng-class="{active: $index == dropdown.current}" ng-bind-html="element.display"></a></li></ul></div>')(scope))
               .appendTo(mainWrap);

       scope.dropdown.filterElement = scope.dropdown.element.find('input');
       scope.dropdown.filterElement.bind('keydown', scope.keyboardEvents);

       scope.fakeAreaElement.css('whiteSpace', 'pre-wrap');
       scope.fakeAreaElement.css('wordWrap', 'break-word');

       properties.forEach(function (prop) {
           scope.fakeAreaElement.css(prop, textArea.css(prop));
       });

       scope.fakeAreaElement.css('width',(parseInt(textArea.outerWidth()) + 1) + 'px');

       mainWrap.insertBefore(textArea);
       textArea.appendTo(mainWrap).addClass('sa-realArea').attr('ng-trim',false);
       $compile(textArea);

       textArea.on('keyup', function(){
           scope.fakeAreaElement.height(textArea.height());
       });

       return mainWrap;
   },
   controller: ['$scope', '$element', '$timeout', '$sce', function($scope, $element, $timeout, $sce){
       $scope.fakeArea = $scope.areaData;
       $scope.dropdownContent = 'Dropdown';
       $scope.dropdown = {
           content: [],
           element: null,
           current: 0,
           select: null,
           customSelect: null,
           filter: '',
           match: '',
           mode: 'append',
           showFilter: false,
           filterElement: null
       };

       $scope.$watch('dropdown.filter', function(){
           $scope.dropdown.current = 0;
       });

       $scope.$watch('areaData', function(){
           $scope.trackCaret();
           checkTriggers();
       });

       $scope.trackCaret = function(){
           var text = $scope.areaData,
                   position = getCharacterPosition();

           $scope.fakeArea = $sce.trustAsHtml(text.substring(0, position) + '<span class="sa-tracking"></span>' + text.substring(position));

           $timeout(function(){
               var span = $scope.fakeAreaElement.find('span.sa-tracking');
               if(span.length > 0){
                   var spanOffset = span.position();

                   $scope.dropdown.element.css({
                                                   top: (spanOffset.top + parseInt($element.css('fontSize')) + 2)+'px',
                                                   left: (spanOffset.left)+'px'
                                               });
               }
               highlightText();
           }, 0);
       };

       $scope.keyboardEvents = function(event){
           if($scope.dropdown.content.length > 0) {
               var code = event.keyCode || event.which;
               // Enter
               if (code === 13) {
                   event.preventDefault();
                   event.stopPropagation();
                   $timeout(function(){
                       $scope.dropdown.selected($scope.dropdown.content[$scope.dropdown.current]);
                   },0);
               }
               // Up
               else if(code === 38){
                   event.preventDefault();
                   event.stopPropagation();
                   $timeout(function(){
                       $scope.dropdown.current--;
                       if($scope.dropdown.current < 0){
                           // Wrap around
                           $scope.dropdown.current = $scope.dropdown.content.length - 1;
                       }
                   },0);
               }
               // Down
               else if(code === 40){
                   event.preventDefault();
                   event.stopPropagation();
                   $timeout(function(){
                       $scope.dropdown.current++;
                       if($scope.dropdown.current >= $scope.dropdown.content.length){
                           // Wrap around
                           $scope.dropdown.current = 0;
                       }
                   },0);
               }
               // Esc
               else if(code === 27){
                   event.preventDefault();
                   event.stopPropagation();
                   $timeout(function(){
                       $scope.dropdown.content = [];
                       $element[0].focus();
                   },0);
               }
               // Backspace
               else if(code === 8){
                   if($scope.dropdown.filter.length < 1){
                       $timeout(function(){
                           $scope.dropdown.content = [];
                           $element[0].focus();
                       },0);
                   }else{
                       event.stopPropagation();
                   }
               }else{
                   $scope.dropdown.filterElement.focus();
               }
           }
       };

       $scope.dropdown.selected = function(item){
           if($scope.dropdown.customSelect !== null){
               var append = $scope.dropdown.mode === 'append';
               addSelectedDropdownText($scope.dropdown.customSelect(item), append);
           }else{
               addSelectedDropdownText(item.display);
           }
           $scope.dropdown.content = [];
       };

       function addSelectedDropdownText(selectedWord, append){

           $scope.dropdown.showFilter = false;
           $scope.dropdown.filter = '';

           var text = $scope.areaData,
                   position = getCharacterPosition(),
                   lastWord = text.substr(0, position).split(/[\s\b{}]/),
                   remove = lastWord[lastWord.length - 1].length;

           if(!append && $scope.dropdown.match){
               remove = $scope.dropdown.match.length;
           }

           if(append || remove < 0){
               remove = 0;
           }

           $scope.areaData = text.substr(0, position - remove) + selectedWord + text.substr(position);

           if(!append && $scope.dropdown.match){
               position = position - $scope.dropdown.match.length + selectedWord.toString().length;
           }

           if($element[0].selectionStart) {
               $timeout(function(){
                   $element[0].focus();
                   $element[0].setSelectionRange(position - remove + selectedWord.toString().length, position - remove + selectedWord.toString().length);
                   checkTriggers();
               }, 100);
           }

       }

       function highlightText(){
           var text = $scope.areaData;

           if(typeof($scope.areaConfig.autocomplete) === 'undefined' || $scope.areaConfig.autocomplete.length === 0){
               return;
           }

           $scope.areaConfig.autocomplete.forEach(function(autoList){
               for(var i=0; i<autoList.words.length; i++){
                   if(typeof(autoList.words[i]) === "string"){
                       text = text.replace(new RegExp("([^\\w]|\\b)("+autoList.words[i]+")([^\\w]|\\b)", 'g'), '$1<span class="'+autoList.cssClass+'">$2</span>$3');
                   }else{
                       text = text.replace(autoList.words[i], function(match){
                           return '<span class="'+autoList.cssClass+'">'+match+'</span>';
                       });
                   }
               }
           });
           $scope.fakeArea = $sce.trustAsHtml(text);
       }

       function checkTriggers(){
           triggerDropdownAutocomplete();
           triggerDropdownAdvanced();
       }

       function triggerDropdownAdvanced(){
           $scope.dropdown.showFilter = false;
           $scope.dropdown.match = false;

           if(typeof($scope.areaConfig.dropdown) === 'undefined' || $scope.areaConfig.dropdown.length === 0){
               return;
           }

           $scope.areaConfig.dropdown.forEach(function(element){
               var text = $scope.areaData,
                       position = getCharacterPosition();

               /*if(typeof(element.trigger) === 'string' && element.trigger === text.substr(position - element.trigger.length, element.trigger.length)){
                   element.list(function(data){
                       $scope.dropdown.content = data.map(function(el){
                           el.display = $sce.trustAsHtml(el.display);
                           return el;
                       });

                       $scope.dropdown.customSelect = element.onSelect;
                       $scope.dropdown.mode = element.mode || 'append';
                       $scope.dropdown.match = '';
                       $scope.dropdown.showFilter = element.filter || false;

                       $timeout(function(){
                           $scope.dropdown.filterElement.focus();
                       }, 10);
                   });
               }else */if(typeof(element.trigger) === 'object'){
                   // I need to get the index of the last match
                   var searchable = text.substr(0, position),
                           match, found = false, lastPosition = 0;
                   while ((match = element.trigger.exec(searchable)) !== null){
                       if(match.index === lastPosition){
                           break;
                       }
                       lastPosition = match.index;
                       if(match.index + match[0].length === position){
                           found = true;
                           break;
                       }
                   }
                   if(found){
                       element.list(match, function(data){
                           $scope.dropdown.content = data.map(function(el){
                               el.display = $sce.trustAsHtml(el.display);
                               return el;
                           });

                           $scope.dropdown.customSelect = element.onSelect;
                           $scope.dropdown.mode = element.mode || 'append';
                           $scope.dropdown.match = match[1];
                           $scope.dropdown.showFilter = element.filter || false;
                       });

                   }
               }
           });
       }

       function resetScroll(){
           $timeout(function(){
               $scope.fakeAreaElement.scrollTop($element.scrollTop());
           }, 5);
       }

       function triggerDropdownAutocomplete(){
           var autocomplete = [],
                   suggestions = [],
                   text = $scope.areaData,
                   position = getCharacterPosition(),
                   lastWord = text.substr(0, position).split(/[\s\b{}]/);

           lastWord = lastWord[lastWord.length-1];

           $scope.areaConfig.autocomplete.forEach(function(autoList){
               autoList.words.forEach(function(word){
                   if(typeof(word) === 'string' && autocomplete.indexOf(word) < 0){
                       if(lastWord.length > 0 || lastWord.length < 1 && autoList.autocompleteOnSpace){
                           autocomplete.push(word);
                       }
                   }
               });
           });

           $scope.areaConfig.dropdown.forEach(function(element){
               if(typeof(element.trigger) === 'string' && autocomplete.indexOf(element.trigger) < 0){
                   autocomplete.push(element.trigger);
               }
           });

           // Now with the list, filter and return
           autocomplete.forEach(function(word){
               if(lastWord.length < word.length && word.toLowerCase().substr(0, lastWord.length) === lastWord.toLowerCase()){
                   suggestions.push({
                                        display: word,
                                        data: null
                                    });
               }
           });

           $scope.dropdown.customSelect = null;
           $scope.dropdown.current = 0;
           $scope.dropdown.content = suggestions;
       }

       function getCharacterPosition() {
           var el = $element[0];
           if (typeof(el.selectionEnd) === "number") {
               return el.selectionEnd;
           }
       }

       $element.bind('keyup click focus', function () {
           $timeout(function(){
               $scope.trackCaret();
           }, 0);
       });

       $element.bind('keydown', function(event){
           resetScroll();
           $scope.keyboardEvents(event);
       });
   }]
};
});