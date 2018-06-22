var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var projectList = [];
var userList = [];

t.render(function() {
    t.organization('id').then(function(organization){
        console.log('org',organization)
    });

    return Promise.all([
            t.get('organization', 'shared', 'projects')
        ])
        .spread(function(projects) {
            if(projects) projectList = projects;
            updateProjectList();
        })
        .then(function() {
            resetView();
        })
});

/** buttons **/
jQuery('.add-project').on('click',function(){
    showProjectEditSection(true, -1);
});
jQuery('.project-save').on('click',function(){
    var isAdding = jQuery('.selected-project').prop('adding');
    var projectName = jQuery('.project-name').val();
    var billingCode = jQuery('.billing-code').val();
    var editingIdx = jQuery('.selected-project').attr('editing');

    if(isAdding)
        projectList.push({
            'name': projectName,
            'code': billingCode
        });
    else {
        projectList[editingIdx].name = projectName;
        projectList[editingIdx].code = billingCode;
    }

    saveProjectList();
});
jQuery('.project-delete').on('click',function(){
    var editingIdx = jQuery('.selected-project').attr('editing');
    projectList.splice(editingIdx, 1);
    saveProjectList();
});
jQuery('.project-cancel').on('click',function(){
    resetView();
});

/** inputs **/
jQuery('.project-name').on('keyup change',function(){
    setSaveDisabledState();
});
jQuery('.billing-code').on('keyup change',function(){
    setSaveDisabledState();
});
jQuery('.projects').on('change',function(){
    var idx = jQuery(this).val();
    showProjectEditSection(false, idx);
});

/** helpers **/
function checkProjectValid() {
    var projectName = jQuery('.project-name').val();
    var billingCode = jQuery('.billing-code').val();
    var isAdding = jQuery('.selected-project').prop('adding');
    var editingIdx = jQuery('.selected-project').attr('editing');

    var nameExists = false;
    if(projectName) {
        for(var i=0;i<projectList.length;i++) {
            if(!isAdding && editingIdx == i) continue;
            if(projectName.toLowerCase() == projectList[i].name.toLowerCase())
                nameExists = true;
        }
    }

    var codeExists = false;
    if(projectName) {
        for(var i=0;i<projectList.length;i++) {
            if(!isAdding && editingIdx == i) continue;
            if(billingCode.toLowerCase() == projectList[i].code.toLowerCase())
                codeExists = true;
        }
    }

    return !nameExists && projectName.length >= 6 && !codeExists && billingCode.length >= 6;
}
function setSaveDisabledState() {
    var btn = jQuery('.project-save');
    btn.prop('disabled', !checkProjectValid());
}
function updateProjectList() {
    var select = jQuery('.projects');
    select.empty();
    select.append("<option value='-1'></option>");
    for(var i=0;i<projectList.length;i++) {
        var projectName = projectList[i].name;
        var billingCode = projectList[i].code;
        select.append("<option value='"+i+"'>"+projectName+" ("+billingCode+")</option>");
    }
}
function saveProjectList() {
    t.set('organization', 'shared', 'projects', projectList)
        .then(function(){
            resetView();
            updateProjectList();
        });
}
function showProjectEditSection(isAdding, editingIdx) {
    jQuery('.projects').prop('disabled', true);
    jQuery('.add-project').prop('disabled', true);
    jQuery('.selected-project').addClass('show');
    if(isAdding) {
        jQuery('.selected-project').prop('adding', true);
    } else {
        jQuery('.selected-project').attr('editing', idx);
    }
    setTimeout(function(){
        if(isAdding)
            jQuery('.project-delete').addClass('hide');
        else {
            jQuery('.project-delete').removeClass('hide');
            jQuery('.project-name').val(projectList[editingIdx].name);
            jQuery('.billing-code').val(projectList[editingIdx].code);
        }

        t.sizeTo('#content').done();
    });
}
function resetView() {
    jQuery('.projects').prop('disabled', false);
    jQuery('.add-project').prop('disabled', false);
    jQuery('.selected-project')
        .removeClass('show')
        .prop('adding', false)
        .attr('editing', '');
    setTimeout(function(){
        t.sizeTo('#content').done();
    });
}