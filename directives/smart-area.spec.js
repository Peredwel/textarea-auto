describe('smartArea directive', function() {
    var $compile, $rootScope, scope, smScope, smCtrl,smElement, $timeout, $sce, $element;

    beforeEach(module('smartArea'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _$sce_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $timeout = _$timeout_;
        $sce = _$sce_;
        scope.qrystring = 'od ver';
        element = $compile('<textarea name="qrystring" ng-model="qrystring" smart-area="config"></textarea>')($rootScope);
        scope.$digest();

        smCtrl = element.controller("smartArea");
        smScope = element.isolateScope();
    }));

    it('smartArea directive can be used only with textarea', function() {
        var element = $compile('<input type="text" name="date" ng-model="qrystring" smart-area="config"/>')($rootScope);
        scope.qrystring = 'od ver';
        scope.$digest();
    });

    it('smartArea directive TextArea Event- KeyUp', inject(function($timeout) {
        updateSMConfig(smScope);
        element.val('od Ve').triggerHandler('keyup');
        $timeout.flush();
    }));

    it('smartArea directive TextArea Event- KeyUp - Empty Configuration', inject(function($timeout) {
        updateSMConfig(smScope);
        smScope.areaConfig.dropdown = [];
        element.val('od Ve').triggerHandler('keyup');
        $timeout.flush();
    }));

    it('smartArea directive TextArea Event- keydown', inject(function($timeout) {
        updateSMConfig(smScope);
        element.triggerHandler('keydown');
        $timeout.flush();
    }));

    it('smartArea directive TextArea Event- keyup click focus', inject(function($timeout) {
        updateSMConfig(smScope);
        element.triggerHandler('keyup click focus');
        $timeout.flush();
    }));

    it('smartArea directive auto populate order detail column names', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.trackCaret();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- Enter (selected dropdown - matching)', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.current = 0;
        smScope.dropdown.mode = "replace";
        smScope.dropdown.content = [{display:"version", item:{dispName:"version", dispValue:"ver"}}];
        smScope.dropdown.customSelect = smScope.areaConfig.dropdown[0].onSelect;
        smScope.dropdown.match = "ve";
        var e = $.Event('enter');
        e.which = 13;
        e.keyCode = 13;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- Enter (not selected from dropdown)', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['version'];
        var e = $.Event('enter');
        e.which = 13;
        e.keyCode = 13;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- Arrow key Up', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['ver'];
        var e = $.Event('keyUp');
        e.which = 38;
        e.keyCode = 38;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- Arrow Key Down', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['ver'];
        var e = $.Event('keyDown');
        e.which = 40;
        e.keyCode = 40;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- Esc', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['ver'];
        var e = $.Event('esc');
        e.which = 27;
        e.keyCode = 27;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- backspace', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['ver'];
        smScope.dropdown.filter = ['ver'];
        var e = $.Event('backspace');
        e.which = 8;
        e.keyCode = 8;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- backspace - empty selected', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown.content = ['ver'];
        smScope.dropdown.filter = [];
        var e = $.Event('backspace');
        e.which = 8;
        e.keyCode = 8;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive auto populate order detail keyboard event- any other', function() {
        scope.qrystring = 'od ver';
        updateSMConfig(smScope);
        smScope.dropdown = {content:['ver'],filter :['ver'],filterElement:element.find('span.sa-tracking')};
        var e = $.Event('e');
        e.which = 65;
        e.keyCode = 65;
        smScope.keyboardEvents(e);
        scope.$digest();
        $timeout.flush();
    });

    it('smartArea directive TextArea Event- KeyUp - highlightText- autocomplete- empty', inject(function($timeout) {
        updateSMConfig(smScope);
        smScope.areaConfig.autocomplete = [];
        element.val('od Ve').triggerHandler('keyup');
        $timeout.flush();
    }));

    it('smartArea directive TextArea Event- KeyUp - highlightText()- autocomplete- not empty', inject(function($timeout) {
        updateSMConfig(smScope);
        smScope.areaConfig.autocomplete[0] = { words: ["/\s([A-Za-z]+[_A-Za-z0-9]+)/gi"],cssClass: 'user'};
        element.val('od Ve').triggerHandler('keyup');
        $timeout.flush();
    }));

    function updateSMConfig(smScope){
        var data = [{dispName:"version", dispValue:"ver"},{dispName:"version1", dispValue:"ver"},{dispName:"version2", dispValue:"ver"}];
        smScope.areaData = 'od ver';
        smScope.areaConfig = {
            autocomplete: [
                {
                    words: [/\s([A-Za-z]+[_A-Za-z0-9]+)/gi],
                    cssClass: 'user'
                }
            ],
            dropdown: [
                {
                    trigger: /\s([A-Za-z]+[_A-Za-z0-9]+)/gi,
                    list: function(match, callback){

                        var listData = data.filter(function(element){
                            return element.dispName.substr(0,match[1].length).toLowerCase() === match[1].toLowerCase()
                                    && element.dispName.length > match[1].length;
                        }).map(function(element){
                            return {
                                display: element.dispName, // This gets displayed in the dropdown
                                item: element // This will get passed to onSelect
                            };
                        });
                        callback(listData);

                    },
                    onSelect: function(item){
                        return item.display;
                    },
                    mode: 'replace'
                }
            ]
        };
    }

});