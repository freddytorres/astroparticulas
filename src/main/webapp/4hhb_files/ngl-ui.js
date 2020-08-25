(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('preact'), require('redux')) :
	typeof define === 'function' && define.amd ? define(['preact', 'redux'], factory) :
	(global.NGLUI = factory(global.preact,global.Redux));
}(this, (function (preact,redux) { 'use strict';

var SET_VIEW = 'SET_VIEW';

// structure view
var SET_STRUCTURE_VIEW = 'SET_STRUCTURE_VIEW';
var SET_ASSEMBLY = 'SET_ASSEMBLY';
var SET_MODEL = 'SET_MODEL';
var SET_SYMMETRY = 'SET_SYMMETRY';
var SET_STYLE = 'SET_STYLE';
var SET_COLOR_SCHEME = 'SET_COLOR_SCHEME';
var SET_LIGAND_STYLE = 'SET_LIGAND_STYLE';
var SET_QUALITY = 'SET_QUALITY';
var SET_WATER_VISIBILITY = 'SET_WATER_VISIBILITY';
var SET_ION_VISIBILITY = 'SET_ION_VISIBILITY';
var SET_HYDROGEN_VISIBILITY = 'SET_HYDROGEN_VISIBILITY';
var SET_CLASH_VISIBILITY = 'SET_CLASH_VISIBILITY';
var SET_DEFAULT_STRUCTURE_VIEW = 'SET_DEFAULT_STRUCTURE_VIEW';

// ed maps
var SET_2FOFC = 'SET_2FOFC';
var SET_FOFC = 'SET_FOFC';
var SET_SCROLL = 'SET_SCROLL';
var SET_2FOFC_LEVEL = 'SET_2FOFC_LEVEL';
var SET_FOFC_LEVEL = 'SET_FOFC_LEVEL';
var SET_MAP_STYLE = 'SET_MAP_STYLE';
var SET_BOX_SIZE = 'SET_BOX_SIZE';
var SET_EDMAPS_LIGAND = 'SET_EDMAPS_LIGAND';
var SET_DEFAULT_EDMAPS_VIEW = 'SET_DEFAULT_EDMAPS_VIEW';

// ligand viewer
var SET_LIGAND = 'SET_LIGAND';
var SET_POCKET_OPACITY = 'SET_POCKET_OPACITY';
var SET_POCKET_NEAR_CLIPPING = 'SET_POCKET_NEAR_CLIPPING';
var SET_POCKET_RADIUS_CLIPPING = 'SET_POCKET_RADIUS_CLIPPING';
var SET_LABEL = 'SET_LIGAND_LABEL';
var SET_POLYMER_DISPLAY = 'SET_POLYMER_DISPLAY';
var SET_DEFAULT_LIGAND_VIEW = 'SET_DEFAULT_LIGAND_VIEW';
var SET_POCKET_COLOR = 'SET_POCKET_COLOR';
// ligand viewer checkboxes
var SET_HYDROGEN_BOND = 'SET_HYDROGEN_BOND';
var SET_HALOGEN_BOND = 'SET_HALOGEN_BOND';
var SET_HYDROPHOBIC = 'HYDROPHOBIC';
var SET_PI_INTERACTION = 'SET_PI_INTERACTION';
var SET_METAL_COORDINATION = 'SET_METAL_COORDINATION';

// viewer
var SET_SPIN = 'SET_SPIN';
var CENTER = 'CENTER';
var SET_FULLSCREEN = 'SET_FULLSCREEN';
var SCREENSHOT = 'SCREENSHOT';
var SET_FOCUS = 'SET_FOCUS';
var SET_CAMERA_TYPE = 'SET_CAMERA_TYPE';
var SET_BACKGROUND = 'SET_BACKGROUND';

// presets
var SYMMETRY = 'symmetry';
var VALIDATION_REPORT = 'validationReport';
var LIGAND_INTERACTION = 'ligandInteraction';
var ELECTRON_DENSITY_MAPS = 'electronDensityMaps';

// views
var STRUCTURE_VIEW = 'structureView';
var EDMAPS_VIEW = 'edmapsView';
var LIGAND_VIEW = 'ligandView';
var VIEWER = 'viewer';

// urls
var validationUrlPrefix = '//ftp.rcsb.org/pub/pdb/validation_reports/';
var validationUrlSuffix = '_validation.xml.gz';
var edmapsUrl = '//edmaps.rcsb.org/maps/';

// default values
var autoViewDefault = 1; // stage.autoView default param
var autoViewAnimate = 250; // stage.autoView param to render animation
var edmapsLevel2fofc = 1.5;
var edmapsLevelFofc = 3;
var edmapsBoxSize = 20;

var tooltips = {
    // structure view
    assembly:                'View structure as asymmetric unit, biological assembly, unit cell, or stacked unit cells',
    symmetry:                'View intrinsic molecular symmetry',
    model:                   'View specific model for multi-model structure',
    style:                   'View the structure in different presentation styles',
    colorScheme:             'Color the structure using different schemes',
    ligandStyle:             'Change ligand presentation style',
    quality:                 'Adjust rendering quality',
    water:                   'Show/hide water molecules',
    ion:                     'Show/hide ions',
    hydrogen:                'Show/hide hydrogen atoms',
    clash:                   'Show/hide clashes between atoms (indicated by pink disks) as specified in the Validation Report',
    btnDefaultStructureView: 'Reset to the default structure view',

    // edmaps
    map:                     'Select the map to display, 2fo-fc (blue), fo-fc (positive: green, negative: red)',
    scroll:                  'Select the map whose ISO level will be changed via "Ctrl scroll-wheel"',
    level2fofc:              'The ISO level of the 2fo-fc map',
    levelFofc:               'The ISO level of the fo-fc map',
    mapStyle:                'Change the display style of the map',
    boxSize:                 'The Map Size in \u212Bngstr\u00F6ms',
    ligandEdmaps:            'Select the ligand to display',
    btnDefaultMapsView:      'Set the Electron Density Maps to the default view',

    // ligand view
    ligandViewLigand:        'Select the ligand to display',
    pocketOpacity:           'Adjust the opacity of the ligand pocket from 0 - 100 percent',
    pocketNearClipping:      'Adjust the clipping of the ligand pocket',
    pocketRadiusClipping:    'Adjust the radious clipping of the ligand pocket',
    pocketColor:             'Color the pocket surface using different schemes',
    hydrogenBond:            'Show/hide hydrogen bonds. Donor and acceptor atoms within 3.5 Angstrom.',
    halogenBond:             'Show/hide halogen bonds. Candidate halogens atoms within 4.0 Angstrom of acceptor atoms.',
    hydrophobic:             'Show/hide hydrophobic interactions. Generally hydrocarbon and fluorine atoms within 4.0 Angstrom.',
    piInteraction:           'Show/hide cation-pi and pi-stacking interactions. Complexes of aromatic rings and positive charges.',
    metalCoordination:       'Show/hide metal interactions. Dative bonds and ionic/ionic-type interactions involving metals.',
    label:                   'Display labels for the ligand',
    polymerDisplay:          'Show or hide the current polymer display',
    btnDefaultLigandView:    'Set the default ligand view',

    // viewer
    spin:                    'Start/stop spinning the structure along the y-axis',
    center:                  'Reset molecule position',
    fullscreen:              'Activate/disable fullscreen mode',
    screenshot:              'Download screenshot at twice the displayed resolution',
    focus:                   'Move far and near clipping planes towards the center'
};

function bionumber2assembly(bionumber) {
    return (!bionumber || bionumber === 'asym' || bionumber === '0' || bionumber === 0) ? '__AU' : 'BU' + bionumber
}

// get colorScale based on colorScheme
function getColorScale(colorScheme) {
    if (colorScheme === 'hydrophobicity') {
        return 'RdYlGn'
    } else if (colorScheme === 'bfactor') {
        return 'OrRd'
    } else {
        return 'RdYlBu'
    }
}

// get colorReverse based on colorScheme
function getColorReverse(colorScheme) {
    return (
        colorScheme === 'residueindex' ||
        colorScheme === 'chainname' ||
        colorScheme === 'hydrophobicity'
    )
}

// get ligand colorScheme
function getLigandColorScheme(state) {
    var colorScheme = state.colorScheme;
    if (colorScheme === 'moleculetype') {
        return 'moleculetype'
    } else if (colorScheme === 'bfactor') {
        return 'bfactor'
    } else if (colorScheme === 'densityfit') {
        return nglUi.sc.structure.validation ? 'densityfit' : 'element'
    } else if (colorScheme === 'geoquality') {
        return nglUi.sc.structure.validation ? 'geoquality' : 'chainname'
    } else {
        return 'element'
    }
}

function getDefaultStyle(sizeScore) {
    return (sizeScore < 200000) ? 'cartoon' : 'surface'
}

function getDefaultColorScheme(sizeScore) {
    return (sizeScore < 200000) ? 'residueindex' : 'chainname'
}


// get sele
function getSele(state, type, repr) {
    var sele = '';

    var model = state.model;
    var hydrogenVisibility = state.hydrogenVisibility;
    var ionVisibility = state.ionVisibility;
    var waterVisibility = state.waterVisibility;

    if (type === 'polymer') {
        if (repr === 'cartoon' || repr === 'backbone') {
            if (model !== 'all') {
                sele = '/' + model;
            }
        } else if (repr === 'base') {
            sele = 'polymer and nucleic';
            if (model !== 'all') {
                sele += ' and /' + model;
            }
        } else if (repr === 'surface' || repr === 'spacefill' || repr === 'licorice') {
            if (repr === 'surface' && nglUi.sizeScore > 500000) {  // for HIV capsids 3J3Q and 3J3Y for example
                sele = '.CA';
            } else {
                sele = 'polymer and ( protein or nucleic )';
            }
            if (model !== 'all') {
                sele += ' and /' + model;
            }
            if (hydrogenVisibility === false) {
                sele += ' and not hydrogen';
            }
        } else if (repr === 'line' || repr === 'point') {
            sele = 'all';
            if (model !== 'all') {
                sele += ' and /' + model;
            }
            if (hydrogenVisibility === false) {
                sele += ' and not hydrogen';
            }
            if (ionVisibility === false) {
                sele += ' and not ion';
            }
            if (waterVisibility === false) {
                sele += ' and not water';
            }
        } else if (repr === 'ballandstick') {
            if (nglUi.sc.structure.validation) {
                sele = '( ' + nglUi.sc.structure.validation.clashSele + ' )';
                if (model !== 'all') {
                    sele += ' and /' + model;
                }
                if (hydrogenVisibility === false) {
                    sele += ' and not hydrogen';
                }
            } else {
                sele = 'NONE';
            }
        }
    } else if (type === 'ligand') {
        sele = '( not polymer or not ( protein or nucleic ) )';
        if (model !== 'all') {
            sele += ' and /' + model;
        }
        if (hydrogenVisibility === false) {
            sele += ' and not hydrogen';
        }
        if (ionVisibility === false) {
            sele += ' and not ion';
        }
        if (waterVisibility === false) {
            sele += ' and not water';
        }
    }
    return sele
}

function getSubdiv(state) {
    var quality = state.quality;
    var sizeScore = nglUi.sizeScore;

    if (quality === 'auto') {
        if (sizeScore < 15000) {
            return 12
        } else if (sizeScore < 70000) {
            return 6
        } else {
            return 3
        }
    } else {
        if (quality === 'high') {
            return 12
        } else if (quality === 'medium') {
            return 6
        } else {
            return 3
        }
    }
}

function getRadialSegments(state, type, repr) {
    var quality = state.quality;
    var sizeScore = nglUi.sizeScore;

    if (quality === 'auto') {
        if (sizeScore < 15000) {
            return 20
        } else if (sizeScore < 70000) {
            return 10
        } else {
            return (type === 'polymer' && repr === 'cartoon') ? 6 : 5
        }
    } else {
        if (quality === 'high') {
            return 20
        } else if (quality === 'medium') {
            return 10
        } else {
            return (type === 'polymer' && repr === 'cartoon') ? 6 : 5
        }
    }
}

function getSphereDetail(state) {
    var quality = state.quality;
    var sizeScore = nglUi.sizeScore;

    if (quality === 'auto') {
        return sizeScore < 15000 ? 1 : 0
    } else {
        return (quality === 'high' || quality === 'medium') ? 1 : 0
    }
}

function getLineOnly(state) {
    var sizeScore = nglUi.sizeScore;
    var quality = state.quality;
    return (quality === 'auto') ? sizeScore > 250000 : quality === 'low'
}

// return scaleFactor as a function of nglUi.scaleFactor and state.quality
function getScaleFactor$1(state) {
    var quality = state.quality;
    var scaleFactor = nglUi.scaleFactor;

    if (quality === 'low')         { return scaleFactor * 0.25 }
    else if (quality === 'medium') { return scaleFactor * 0.5 }
    else if (quality === 'high')   { return scaleFactor * 2 }
    else                           { return scaleFactor * 1 }
}

// set loading message
function setLoading(loading) {
    if (loading) {
        $('#loading').show();
    } else {
        $('#loading').hide();
    }
}

// return a clone of initState obj - used to prevent initState getting mutated when passed to Object.assign
function getInitState(view) {
    if (view === STRUCTURE_VIEW) {
        return Object.assign({}, nglUi.initStateStructureView)
    } else if (view === EDMAPS_VIEW) {
        return Object.assign({}, nglUi.initStateEdmaps)
    } else if (view === LIGAND_VIEW) {
        return Object.assign({}, nglUi.initStateLigandView)
    } else if (view === VIEWER) {
        return Object.assign({}, nglUi.initStateViewer)
    }
}

function getInitStateAll() {
    return Object.assign({},
            getInitState(STRUCTURE_VIEW),
            getInitState(EDMAPS_VIEW),
            getInitState(LIGAND_VIEW),
            getInitState(VIEWER))
}

function getSymmetryFromSele(options, sele) {
    for ( var i = 0; i < options.length; i++) {
        var option = options[i];
        var label = option.label;
        // C2 (global)
        if (label.indexOf(sele) === 0) {
            return option.value
        }
    }
    return -1
}

function getFirstSymmetry(options) {
    for ( var i = 0; i < options.length; i++) {
        var option = options[i];
        if (option.value > -1) {
            return option.label
        }
    }
    return 'None'
}


function getLigandFromSele(options, sele) {
    for ( var i = 0; i < options.length; i++) {
        var option = options[i];
        var label = option.label;
        if (label.indexOf('[') === 0) {
            // [TRE]1001:A
            var s = label.substring(1, label.indexOf(']'));
            console.log('s=' + s);
            if (s === sele) {
                return label.substring(label.indexOf(']') + 1)
            }
        }
    }
    return ''
}

// the following functions are for dev only ----------------------------------------------------------------------------

// return obj in json format - for data only - for objects containing functions use inspect or inspectRecursive
function toJsonStr(obj, name, whitespace) {
    if (!name) { name = 'obj'; }
    if (whitespace === undefined || whitespace) {
        console.log('----------------------------------------');
        console.log(name + ':');
        console.log(JSON.stringify(obj, null, 2));
        console.log('----------------------------------------');
    } else {
        console.log(name + ': ' + JSON.stringify(obj));
    }
}

// inspect any obj for debugging - returns only the top-level props
function inspect(obj, name) {
    if (!name) { name = 'obj'; }
    console.log('========================================');
    console.log(name + ':');
    if (Array.isArray(obj)) { // array is obj too so expicitly check for it before checking for object
        obj.forEach(function (item) { return console.log(item); });
    } else if (typeof obj === 'object'){
        for (var prop in obj) {
            console.log(prop + '=' + obj[prop]);
        }
    } else {
        console.log(obj);
    }
    console.log('========================================');
}

//import * as u from './util'

// ui drop-down options

function getOptions(assembly) {
    return {
        // structureView
        assembly: getAssembly(),
        model: getModel(),
        symmetry: getSymmetry(assembly),
        style: getStyle(),
        colorScheme: getColorScheme(),
        ligandStyle: getLigandStyle(),
        quality: getQuality(),

        // edmaps
        mapStyle: getMapStyle(),

        // edmaps and ligand
        ligand: getLigand(),

        // ligand
        pocketColor: getPocketColor (),

        // viewer
        cameraType: getCameraType(),
        background: getBackground()
    }
}

function getAssembly() {
    var options = [];
    var structure = nglUi.sc.structure;
    var biomolDict = structure.biomolDict;
    if (nglUi.isFullStructure) {
        addOption(options, 'BU1', 'Full Structure');
    } else {
        var label = (structure.unitcell) ? 'Asymmetric Unit' : 'Full Structure';
        addOption(options, '__AU', label);
        for (var name in biomolDict) {
            if (name === 'UNITCELL') {
                addOption(options, name, 'Unitcell');
            } else if (name === 'SUPERCELL') {
                addOption(options, name, 'Supercell');
            } else if (name.substr(0, 2) === 'BU') {
                label = 'Bioassembly ' + name.substr(2);
                addOption(options, name, label);
            } else {
                addOption(options, name, name);
            }
        }
    }
    return options
}

function getModel() {
    var options = [];
    var modelStore = nglUi.sc.structure.modelStore;
    if (modelStore.count > 1) {
        addOption(options, 'all', 'All Models');
    }
    for (var i = 0; i < modelStore.count; ++i) {
        addOption(options, i, 'Model ' + (i + 1));
    }
    return options
}

function getSymmetry(assembly) {
    var options = [];
    addOption(options, -1, 'None');
    if (nglUi.symmetryData[assembly]) {
        var symmetries = nglUi.symmetryData[assembly].symmetries;
        symmetries.forEach(function (symmetry, i) {
            addOption(options, i, symmetry.label);
        } );
    }
    return options
}

function getStyle() {
    var options = [];
    addOption(options, '', 'None');
    addOption(options, 'backbone', 'Backbone');
    addOption(options, 'surface', 'Surface');
    addOption(options, 'cartoon', 'Cartoon');
    if (!nglUi.reduced) {
        addOption(options, 'spacefill', 'Spacefill');
        addOption(options, 'licorice', 'Licorice');
    }
    addOption(options, 'line', 'Line');
    return options
}

function getColorScheme() {
    var options = [];
    var bfactor = true;
    var densityfit = true;
    var geoquality = true;
    var randomcoilindex = false;
    var methods = nglUi.sc.structure.header.experimentalMethods;
    if (methods) {
        if (!methods.includes('X-RAY DIFFRACTION') &&
            !methods.includes('ELECTRON CRYSTALLOGRAPHY') &&
            !methods.includes('NEUTRON DIFFRACTION')
        ) {
            bfactor = false;
            densityfit = false;
        }
        if (methods.includes('SOLUTION NMR') ||
            methods.includes('SOLID-STATE NMR')
        ) {
            randomcoilindex = true;
        }
    }
    if (!nglUi.hasValidationReport) {
        densityfit = false;
        geoquality = false;
        randomcoilindex = false;
    }
    if (!nglUi.hasEdmaps) {
        densityfit = false;
    }

    addOption(options, 'chainname', 'By Chain');
    addOption(options, 'residueindex', 'Rainbow');
    addOption(options, 'element', 'By Element/CPK');
    addOption(options, 'resname', 'By Residue');
    addOption(options, 'moleculetype', 'By Molecule Type');
    if (bfactor) {
        addOption(options, 'bfactor', 'By B-factor');
    }
    addOption(options, 'sstruc', 'By Secondary Structure');
    addOption(options, 'hydrophobicity', 'By Hydrophobicity');
    if (densityfit) {
        addOption(options, 'densityfit', 'By Density Fit');
    }
    if (geoquality) {
        addOption(options, 'geoquality', 'By Geometry Quality');
    }
    if (randomcoilindex) {
        addOption(options, 'randomcoilindex', 'By NMR Random Coil Index');
    }
    return options
}

function getLigandStyle() {
    var options = [];
    addOption(options, '', 'None');
    addOption(options, 'ballandstick', 'Ball & Stick');
    addOption(options, 'spacefill', 'Spacefill');
    return options
}

function getQuality() {
    var options = [];
    addOption(options, 'auto', 'Automatic');
    addOption(options, 'low', 'Low');
    addOption(options, 'medium', 'Medium');
    addOption(options, 'high', 'High');
    return options
}

// edmaps
function getMapStyle() {
    var options = [];
    addOption(options, 'contour', 'Mesh');
    addOption(options, 'smooth', 'Smooth');
    addOption(options, 'flat', 'Flat');
    return options
}

// edmaps and ligand viewer
function getLigand() {
    var options = [];

    // do not return ligand options if reduced mmtf file is used
    if (!nglUi.reduced) {
        var ligandSele = '( not polymer or not ( protein or nucleic ) ) and not ( water or ACE or NH2 ) and /0';
        var ligands = [];

        nglUi.sc.structure.eachResidue(function (rp) {
            if (rp.isWater()) { return }
            var sele = '';
            if (rp.resno !== undefined) { sele += rp.resno; }
            if (rp.inscode) { sele += '^' + rp.inscode; }
            if (rp.chain) { sele += ':' + rp.chainname; }
            var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele;
            ligands.push([sele, name]);
        }, new NGL.Selection(ligandSele));

        if (ligands.length > 0) {
            addOption(options, '', 'None');
            ligands.forEach(function (d) {
                addOption(options, d[0], d[1]);
            });
        }
    }
    return options
}

function getPocketColor () {
    var options = [];
    addOption(options, 'hydrophobicity', 'By Hydrophobicity');
    addOption(options, 'element', 'By Element/CPK');
    addOption(options, 'bfactor', 'By B-factor');

    return options
}

// viewer options
function getCameraType() {
    var options = [];
    addOption(options, 'perspective', 'Perspective Camera');
    addOption(options, 'orthographic', 'Orthographic Camera');

    return options
}

function getBackground() {
    var options = [];
    addOption(options, 'white', 'White background');
    addOption(options, 'black', 'Black background');

    return options
}

function addOption(options, value, label) {
    options.push({value: value, label: label});
}

var file$1 = 'reducers.js';

// update state according to action type
function app(state, action) {
    var type = action.type;
    // do not log range input
    if (  !(type === SET_2FOFC_LEVEL ||
            type === SET_FOFC_LEVEL ||
            type === SET_BOX_SIZE ||
            type === SET_POCKET_NEAR_CLIPPING ||
            type === SET_POCKET_RADIUS_CLIPPING ||
            type === SET_POCKET_OPACITY ||
            type === SET_FOCUS)) {
        toJsonStr(action, file$1 + ': action', false);
    }

    // these params are assigned to updated state for all actions
    var p = {
        autoView: -1, // by default do not call autoView after updating reprs
        action: action };

    switch (type) {
        case SET_VIEW: {
            p.view = action.value;
            break
        }

        //  structure view
        case SET_STRUCTURE_VIEW: {
            p.autoView = autoViewDefault;
            break
        }
        case SET_ASSEMBLY: {
            var assembly = action.value;
            var symmetryOptions = getSymmetry(assembly);
            p.assembly = assembly;
            p.symmetry = nglUi.initStateStructureView.symmetry,
            p.options = Object.assign({}, state.options, { symmetry: symmetryOptions});
            p.autoView = autoViewAnimate;
            break
        }
        case SET_MODEL: {
            p.model = (action.value === 'all') ? 'all' : parseInt(action.value);
            p.autoView = autoViewAnimate;
            break
        }
        case SET_SYMMETRY:
            p.symmetry = parseInt(action.value);
            p.autoView = autoViewAnimate;
            break
        case SET_STYLE:
            p.style = action.value;
            break
        case SET_COLOR_SCHEME:
            p.colorScheme = action.value;
            break
        case SET_LIGAND_STYLE:
            p.ligandStyle = action.value;
            break
        case SET_QUALITY:
            p.quality = action.value;
            break
        case SET_CLASH_VISIBILITY:
            p.clashVisibility = action.value;
            break
        case SET_HYDROGEN_VISIBILITY:
            p.hydrogenVisibility = action.value;
            break
        case SET_ION_VISIBILITY:
            p.ionVisibility = action.value;
            break
        case SET_WATER_VISIBILITY:
            p.waterVisibility = action.value;
            break
        case SET_DEFAULT_STRUCTURE_VIEW: {
            Object.assign(p, getInitStateAll());
            p.view = STRUCTURE_VIEW; // TODO view should be set by by tabs
            if (state.assembly !== nglUi.initStateStructureView.assembly) { // update state.options.symmetry
                var symmetryOptions$1 = getSymmetry(nglUi.initStateStructureView.assembly);
                p.options = Object.assign({}, state.options, { symmetry: symmetryOptions$1 });
            }
            p.autoView = autoViewAnimate;
            break
        }

        // edmaps
        case SET_2FOFC: {
            p.map2fofc = action.value;
            if (action.value) {
                p.scroll = '2fofc';
                p.level2fofc = state.level2fofc === 0 ? edmapsLevel2fofc : state.level2fofc;
                p.boxSize = state.boxSize < 1 ? edmapsBoxSize : state.boxSize;
                Object.assign(p, getDefaultStructureViewParams(EDMAPS_VIEW));
            } else {
                p.scroll = (state.mapFofc) ? 'fofc' : '';
            }
            p.autoView = autoViewAnimate;
            break
        }
        case SET_FOFC: {
            p.mapFofc = action.value;
            if (action.value) {
                p.scroll = 'fofc';
                p.levelFofc = state.levelFofc === 0 ? edmapsLevelFofc : state.levelFofc;
                p.boxSize = (state.boxSize < 1) ? edmapsBoxSize : state.boxSize;
                Object.assign(p, getDefaultStructureViewParams(EDMAPS_VIEW));
            } else {
                p.scroll = (state.map2fofc) ? '2fofc' : '';
            }
            p.autoView = autoViewAnimate;
            break
        }
        case SET_SCROLL: {
            var scroll = action.value;
            if (scroll === '2fofc' && !state.map2fofc) {
                scroll = (state.mapFofc) ? 'fofc' : '';
            } else if (scroll === 'fofc' && !state.mapFofc) {
                scroll = (state.map2fofc) ? '2fofc' : '';
            }
            p.scroll = scroll;
            break
        }
        case SET_2FOFC_LEVEL:
            p.level2fofc = parseFloat(action.value);
            break
        case SET_FOFC_LEVEL:
            p.levelFofc = parseFloat(action.value);
            break
        case SET_MAP_STYLE:
            p.mapStyle = action.value;
            break
        case SET_BOX_SIZE:
            p.boxSize = parseInt(action.value);
            break
        case SET_EDMAPS_LIGAND:
            Object.assign(p, getLigandParams(action.value));
            break
        case SET_DEFAULT_EDMAPS_VIEW: {
            Object.assign(p, getInitStateAll(), getDefaultStructureViewParams(EDMAPS_VIEW));
            p.map2fofc = true,
            p.scroll = '2fofc',
            p.level2fofc = edmapsLevel2fofc,
            p.boxSize = edmapsBoxSize;
            p.autoView = autoViewAnimate;
            break
        }

        // ligand viewer
        case SET_LIGAND: {
            Object.assign(p, getLigandParams(action.value));
            break
        }
        case SET_POCKET_OPACITY:
            p.pocketOpacity = parseInt(action.value);
            break
        case SET_POCKET_NEAR_CLIPPING:
            p.pocketNearClipping = parseInt(action.value);
            break
        case SET_POCKET_RADIUS_CLIPPING:
            p.pocketRadiusClipping = parseInt(action.value);
            break
        case SET_POCKET_COLOR:
            p.pocketColor = action.value;
            break
        case SET_HYDROGEN_BOND:
            p.hydrogenBond = action.value;
            break
        case SET_HALOGEN_BOND:
            p.halogenBond = action.value;
            break
        case SET_HYDROPHOBIC:
            p.hydrophobic = action.value;
            break
        case SET_PI_INTERACTION:
            p.piInteraction = action.value;
            break
        case SET_METAL_COORDINATION:
            p.metalCoordination = action.value;
            break
        case SET_LABEL:
            p.label = action.value;
            break
        case SET_POLYMER_DISPLAY:
            p.polymerDisplay = action.value;
            break
        case SET_DEFAULT_LIGAND_VIEW:
            Object.assign(p, getLigandParams(state.options.ligand[1].value));
            break

        // viewer options
        case SET_SPIN:
            p.spin = !state.spin;
            break
        case CENTER:
            p.autoView = autoViewAnimate;
            break
        case SET_FULLSCREEN:
            p.fullscreen = !state.fullscreen;
            break
        case SCREENSHOT:
            break
        case SET_FOCUS:
            p.focus = parseInt(action.value);
            break
        case SET_CAMERA_TYPE:
            p.cameraType = action.value;
            break
        case SET_BACKGROUND:
            p.background = action.value;
            break

        // default
        default:
            p.action = { type: 'UNKOWN TYPE', value: type };
            break
    }
    return Object.assign({}, state, p)
}

function getLigandParams(ligand) {
    if (ligand === '') {
        return Object.assign(getInitState(STRUCTURE_VIEW), getInitState(LIGAND_VIEW))
    } else {
        // TODO do these belong in reducer?
        var ligandSelection = new NGL.Selection(ligand);
        var sview = nglUi.sc.structure.getView(ligandSelection);
        var pocketRadius = Math.max(sview.boundingBox.getSize().length() / 2, 2) + 5;
        var params = {
            ligand: ligand,
            ligandSelection: ligandSelection,
            pocketRadius: pocketRadius,
            boxSize: parseInt(pocketRadius) // for edmaps
        };
        return Object.assign(getInitState(LIGAND_VIEW), params, getDefaultStructureViewParams(LIGAND_VIEW))
    }
}

function getDefaultStructureViewParams(view) {
    var params = {};
    params.assembly = (nglUi.isFullStructure) ? 'BU1' : '__AU';
    if (view === EDMAPS_VIEW) {
        params.style = 'line';
        params.colorScheme = 'element';
    } else if (view === LIGAND_VIEW) {
        params.assembly = (nglUi.isFullStructure) ? 'BU1' : '__AU';
        params.style = '';
        //params.ligandStyle = ''
    }
    return params
}

//import * as c from './constants'

function setSpin(state, stage) {
    if (state.spin) {
        stage.setSpin([0, 1, 0], 0.005);
    } else {
        stage.setSpin(null, null);
    }
}

function center() {
    console.log('center');
}

function setFullscreen(state, stage) {
    stage.toggleFullscreen(document.getElementById('ngl-ui'));
}

function screenshot(stage) {
    stage.makeImage({
        factor: 2,
        antialias: true,
        trim: false,
        transparent: false
    }).then(function(blob) {
        NGL.download(blob, (pdbid + "_screenshot.png"));
    });
}

function setFocus(state, stage) {
    stage.setFocus(50 + state.focus * 0.5);
}

function setCameraType(state, stage) {
    stage.setParameters({ cameraType: state.cameraType });
}

function setBackground(state, stage) {
    stage.setParameters({ backgroundColor: state.background });
}

function update$3(state, stage) {
    setSpin(state, stage);
    setFocus(state, stage);
    setCameraType(state, stage);
    setBackground(state, stage);
}

var reprs$1 = {};

function initReprs() {
    var sc = nglUi.sc;
    var hasLigand = nglUi.hasLigand;
    // structureView reprs
    reprs$1.unitcell = null;
    //reprs.unitcell = sc.addRepresentation( 'unitcell', { lazy: true, visible: false, disableImpostor: true } )  // bounding-box not recalculated
    reprs$1.polymer = {
        cartoon: sc.addRepresentation( 'cartoon', {
            lazy: true,
            visible: false,
            aspectRatio: 5,
            radiusScale: 0.7,
        } ),
        base: sc.addRepresentation( 'base', {
            lazy: true,
            visible: false,
        } ),
        backbone: sc.addRepresentation( 'backbone', {
            lazy: true,
            visible: false,
            scale: 2.0,
        } ),
        surface: sc.addRepresentation( 'surface', {
            lazy: true,
            visible: false,
            surfaceType: 'sas',
            probeRadius: 1.4,
            useWorker: true,
        } ),
        spacefill: sc.addRepresentation( 'spacefill', {
            lazy: true,
            visible: false,
        } ),
        licorice: sc.addRepresentation( 'licorice', {
            lazy: true,
            visible: false,
            multipleBond: 'symmetric',
        } ),
        ballandstick: sc.addRepresentation( 'ball+stick', {
            lazy: true,
            visible: false,
            multipleBond: 'symmetric',
        } ),
        line: sc.addRepresentation('line', {
            lazy: true,
            visible: false,
            linewidth: 5,
            multipleBond: 'offset',
        }),
        point: sc.addRepresentation('point', {
            lazy: true,
            visible: false,
            sizeAttenuation: false,
            pointSize: 5,
            alphaTest: 1,
            useTexture: true,
        })
    };
    reprs$1.ligand = {
        spacefill: sc.addRepresentation( 'spacefill', {
            lazy: true,
            visible: false,
        } ),
        ballandstick: sc.addRepresentation( 'ball+stick', {
            lazy: true,
            visible: false,
            scale: 2.5,
            aspectRatio: 1.2,
            radiusSize: 0.4, // default is 0.15
            colorValue: 'grey',
            multipleBond: 'symmetric',
        } )
    };
    reprs$1.validation = {
        validation: sc.addRepresentation( 'validation', {
            lazy: true,
            visible: false,
            color: 'geoquality' } ),
        ballandstick: sc.addRepresentation( 'ball+stick', {
            lazy: true,
            visible: false,
            color: 'geoquality' } )
    };

    // ligandView reprs
    if (hasLigand) {
        reprs$1.ligandView = {
            neighbor: sc.addRepresentation('ball+stick', {
                lazy: true,
                visible: false,
                sele: 'none',
                aspectRatio: 1.1,
                colorValue: 'white',
                multipleBond: 'symmetric'
            }),
            // TODO reuse ligand in structureView
            /*
            ligand: sc.addRepresentation('ball+stick', {
                lazy: true,
                visible: false,
                multipleBond: 'symmetric',
                colorValue: 'grey',
                sele: 'none',
                aspectRatio: 1.2,
                scale: 2.5
            }),
            */
            contact: sc.addRepresentation('contact', {
                lazy: true,
                visible: false,
                sele: 'none',
                radius: 0.07,
                weakHydrogenBond: false,
                ionicInteraction: false,
                refineSaltBridges: false
            }),
            pocket: sc.addRepresentation('surface', {
                lazy: true,
                visible: false,
                sele: 'none',
                opaqueBack: false,
                roughness: 1.0,
                surfaceType: 'av'
            }),
            label: sc.addRepresentation('label', {
                lazy: true,
                visible: false,
                sele: 'none',
                color: '#333333',
                yOffset: 0.2,
                zOffset: 2.0,
                attachment: 'bottom-center',
                showBackground: true,
                backgroundColor: 'white',
                backgroundOpacity: 0.5,
                disablePicking: true,
                radiusType: 'size',
                radiusSize: 1.0,
                labelType: 'residue',
                labelGrouping: 'residue'
            })
        };
    }
}

// @params {object} o object to be passed back to the callback
// @params {function} callback the callback function
function load(state, stage, callback) {
    var dir = pdbid.substring(1, 3);
    var validationUrl = validationUrlPrefix + dir + '/' + pdbid + '/' + pdbid + validationUrlSuffix;
    console.log('validationUrl=' + validationUrl);

    NGL.autoLoad(validationUrl, { ext: 'validation' }).then( function(validation) {
        nglUi.sc.structure.validation = validation;
        callback(state, stage, true);
    } ).catch(function(e) {
        console.log('error=' + e);
        callback(state, stage, false);
    } );
}

var file$2 = 'structure-view.js';

// update structure view based on state
function update$2(state, stage) {
    var assembly = state.assembly;
    var model = state.model;
    var symmetry = state.symmetry;
    var style = state.style;
    var colorScheme = state.colorScheme;
    var ligandStyle = state.ligandStyle;
    var quality = state.quality;
    var clashVisibility = state.clashVisibility;
    var action = state.action;

    //u.inspect(state, 'state in ' + file)

    if ((clashVisibility || colorScheme === 'densityfit' || colorScheme === 'geoquality' || colorScheme === 'randomcoilindex') &&
            !nglUi.sc.structure.validation) {
        // load validation
        setLoading(true);
        load(state, stage, validationLoaded);
    } else {
        nglUi.sc.defaultAssembly = assembly;
        console.log(file$2 + ': update: nglUi.sc.defaultAssembly=' + nglUi.sc.defaultAssembly + ' (' + assembly + ')');

        // unitcell
        if (assembly === 'UNITCELL') {
            if (!reprs$1.unitcell) { reprs$1.unitcell = nglUi.sc.addRepresentation( 'unitcell', { visible: true, disableImpostor: true } ); }
        } else {
            if (reprs$1.unitcell !== null) {
                nglUi.sc.removeRepresentation(reprs$1.unitcell);
                reprs$1.unitcell = null;
            }
        }
        //reprs.unitcell.setVisibility(assembly === 'UNITCELL') // bounding-box not recalculated - use above implementation

        // polymer
        if (style !== '') {
            var repr = reprs$1.polymer[style];

            // set selection before params
            repr.setSelection(getSele(state, 'polymer', style));
            if (style === 'cartoon') { reprs$1.polymer.base.setSelection(getSele(state, 'polymer', 'base')); }
            else if (style === 'line') { reprs$1.polymer.point.setSelection(getSele(state, 'polymer', 'point')); }

            // set params - note: not all params are used for every repr - if not used it is ignored by NGL
            var p = {
                assembly: assembly,
                colorScheme: colorScheme,
                colorScale: getColorScale(colorScheme),
                colorReverse: getColorReverse(colorScheme),
                scaleFactor: getScaleFactor$1(state),
                sphereDetail: getSphereDetail(state),
                subdiv: getSubdiv(state),
                lineOnly: getLineOnly(state),
                radialSegments: getRadialSegments(state, 'polymer', style) };
            repr.setParameters(p);
            if (style === 'cartoon') { reprs$1.polymer.base.setParameters(p); }
            else if (style === 'line') { reprs$1.polymer.point.setParameters(p); }
        }
        setPolymerVisibility(style);

        // ligand
        if (ligandStyle !== '') {
            var repr$1 = reprs$1.ligand[ligandStyle];
            var p$1 = {
                assembly: assembly,
                colorScheme: getLigandColorScheme(state),
                quality: quality,
                radiusSize: (state.ligand === '') ? 0.4 : 0.15};
            repr$1.setParameters( p$1 );
            repr$1.setSelection(getSele(state, 'ligand', ligandStyle));
        }
        setLigandVisibility(ligandStyle);

        if (clashVisibility) {
            var sele = nglUi.sc.structure.validation.clashSele;
            if (model !== 'all') {
                sele = '(' + sele + ') and /' + model;
            }
            if (state.hydrogenVisibility === false) {
                sele = '(' + sele + ') and not hydrogen';
            }
            for(var prop in reprs$1.validation) {
                var repr$2 = reprs$1.validation[prop];
                repr$2.setSelection(sele);
                repr$2.setVisibility(true);
            }
        } else {
            for(var prop$1 in reprs$1.validation) {
                reprs$1.validation[prop$1].setVisibility(false);
            }
        }

        if (symmetry === -1) {
            clearSymmetryBuffer(state);
        } else {
            if (action.type === SET_SYMMETRY || nglUi.symmetryBuffer === undefined) {
                updateSymmetry(state, stage);
            }
        }

        if (action.type === SET_DEFAULT_STRUCTURE_VIEW) {
            update$$1(state, stage);
            update$1(state, stage);
            update$3(state, stage);
        }
    }
}

// private functions ///////////////////////////////////////////////////////////////////////////////////////////////////

// called after validation.load() has executed
function validationLoaded(state, stage, loaded) {
    setLoading(false);
    if (loaded) {
        update$2(state, stage);
    }
}

// set visibility of reprs
function setPolymerVisibility(style) {
    for(var prop in reprs$1.polymer) {
        var repr = reprs$1.polymer[prop];
        if (prop === 'base') {
            repr.setVisibility(style === 'cartoon'); // show base repr if style is line
        } else if (prop === 'point') {
            repr.setVisibility(style === 'line'); // show point repr if style is line
        } else {
            repr.setVisibility(prop === style);
        }
    }
}

// set visibility of ligand reprs
function setLigandVisibility(ligandStyle) {
    for(var prop in reprs$1.ligand) {
        reprs$1.ligand[prop].setVisibility(prop === ligandStyle);
    }
}

function updateSymmetry(state, stage) {
    clearSymmetryBuffer();
    var assembly = state.assembly;
    var symmetry = state.symmetry;

    if (state.symmetry >= 0 && nglUi.symmetryData[assembly]) {
        var data = nglUi.symmetryData[assembly].symmetries[symmetry];
        if (data && data.axes) {
            // sort by order of the axes so that the view is oriented along the highest order axis
            var axes = data.axes.sort(function (a1, a2) { return a1.order < a2.order ? 1 : -1; });
            nglUi.symmetryBuffer = new SymmetryBuffer(axes, {});
            nglUi.symmetryBuffer.attach(nglUi.sc);

            var tmpVec1 = new (Function.prototype.bind.apply( NGL.Vector3, [ null ].concat( axes[0].start) ));
            var tmpVec2 = new (Function.prototype.bind.apply( NGL.Vector3, [ null ].concat( axes[0].end) ));
            var v1 = new NGL.Vector3().subVectors(tmpVec1, tmpVec2).normalize();
            var v2 = new NGL.Vector3();
            if (axes.length > 1) {
                tmpVec1.set.apply(tmpVec1, axes[1].start);
                tmpVec2.set.apply(tmpVec2, axes[1].end);
                v2.subVectors(tmpVec1, tmpVec2);
            } else {
                v2.set(Math.random(), Math.random(), Math.random());
            }
            v2.normalize().cross(v1).normalize();
            var v3 = new NGL.Vector3().crossVectors(v1, v2).normalize();

            var basis = new NGL.Matrix4();
            basis.makeBasis(v3, v2, v1);
            if (basis.determinant() < 0) {
                basis.scale(new NGL.Vector3(-1, -1, -1));
            }

            var q = new NGL.Quaternion();
            q.setFromRotationMatrix(basis);
            q.inverse();

            stage.animationControls.rotate(q, 1000);
        }
    }
}

// geometry for displaying symmetry axes
var SymmetryBuffer = function(axes, params) {
    var p = Object.assign({}, params);
    var c = new NGL.Color(p.color || "lime");
    var radius = p.radius || getDefaultRadius(axes[0]);
    var shapeRepr;
    var shape = new NGL.Shape("symmetry", {
        disableImpostor: false,
        openEnded: true
    });
    axes.forEach(function(ax) {
        shape.addSphere(ax.start, c, radius);
        shape.addSphere(ax.end, c, radius);
        shape.addCylinder(ax.start, ax.end, c, radius);
    });
    this.attach = function(component) {
        shapeRepr = component.addBufferRepresentation(shape.getBufferList());
    };
    this.dispose = function() {
        if (shapeRepr) { shapeRepr.dispose(); }
    };
};

// calculate default radius based on axis length
function getDefaultRadius(axisData) {
    var start = new (Function.prototype.bind.apply( NGL.Vector3, [ null ].concat( axisData.start) ));
    var end = new (Function.prototype.bind.apply( NGL.Vector3, [ null ].concat( axisData.end) ));
    var axis = new NGL.Vector3().subVectors(start, end);
    return Math.sqrt(axis.length() / 200)
}

// clear symmetryBuffer if it exists
function clearSymmetryBuffer() {
    if (nglUi.symmetryBuffer) {
        nglUi.symmetryBuffer.dispose();
        nglUi.symmetryBuffer = undefined;
    }
}

//const file = 'ligand-view.js'

function setLigand$1(state, stage) {
    var ligand = state.ligand;

    // update structureView reprs
    update$2(state, stage);

    if (ligand === '') {
        for(var repr in reprs$1.ligandView) {
            reprs$1.ligandView[repr].setVisibility(false);
        }
    } else {
        var sc = nglUi.sc;
        var structure = sc.structure;
        var ligandSelection = state.ligandSelection;
        var sview = structure.getView(ligandSelection);

        var modelSele = ' and /' + state.model;

        var withinSele = structure.getAtomSetWithinSelection(ligandSelection, 5);
        var withinSele2 = structure.getAtomSetWithinSelection(ligandSelection, state.pocketRadius + 2);
        var withinGroup = structure.getAtomSetWithinGroup(withinSele);

        var ligandSele = ligand + modelSele;
        var expandedSele = withinGroup.toSeleString();
        var neighborSele = '(' + expandedSele + ') and not (' + ligand + ')' + modelSele;
        var neighborSele2 = '(' + withinSele2.toSeleString() + ') and not (' + ligand + ') and polymer' + modelSele;
        var labelSele = '((' + neighborSele + ') or (' + ligand + '))' + modelSele;
        expandedSele += modelSele;

        if (state.waterVisibility === false) {
            ligandSele = '(' + ligandSele + ') and not water';
            neighborSele = '(' + neighborSele + ') and not water';
            expandedSele = '(' + expandedSele + ') and not water';
            neighborSele2 = '(' + neighborSele2 + ') and not water';
            labelSele = '(' + labelSele + ') and not water';
        }
        if (state.hydrogenVisibility === false) {
            ligandSele = '(' + ligandSele + ') and not hydrogen';
            neighborSele = '(' + neighborSele + ') and not hydrogen';
            expandedSele = '(' + expandedSele + ') and not hydrogen';
            neighborSele2 = '(' + neighborSele2 + ') and not hydrogen';
            labelSele = '(' + labelSele + ') and not hydrogen';
        }

        //reprs.ligandView.ligand.setSelection(ligand + modelSele)
        reprs$1.ligand.ballandstick.setParameters({radiusSize: 0.15});
        reprs$1.ligand.ballandstick.setSelection(ligandSele);
        reprs$1.ligandView.neighbor.setSelection(neighborSele);
        reprs$1.ligandView.contact.setSelection(expandedSele);
        reprs$1.ligandView.pocket.setSelection(neighborSele2);
        reprs$1.ligandView.label.setSelection(labelSele);

        reprs$1.ligandView.contact.setParameters({
            hydrogenBond: state.hydrogenBond,
            halogenBond: state.halogenBond,
            hydrophobic: state.hydrophobic,
            piInteraction: state.piInteraction,
            metalCoordination: state.metalCoordination
        });
        reprs$1.ligandView.pocket.setParameters({
            opacity: state.pocketOpacity,
            clipNear: state.pocketNearClipping,
            clipRadius: state.pocketRadius,
            color: state.pocketColor,
            clipCenter: sview.center
        });

        for(var prop in reprs$1.ligandView) {
            reprs$1.ligandView[prop].setVisibility(true);
        }

        if (nglUi.hasEdmaps && (state.map2fofc || state.map2fofc)) {
            updateBoxSize(state);
        }

        stage.tasks.onZeroOnce(function () { return sc.autoView(expandedSele, autoViewDefault); });
    }
}

// pocket functions

function setPocketOpacity(state) {
    reprs$1.ligandView.pocket.setParameters({ opacity: state.pocketOpacity / 100 });
}

function setPocketNearClipping(state) {
    reprs$1.ligandView.pocket.setParameters({ clipNear: state.pocketNearClipping });
}
function setPocketRadiusClipping(state) {
    var val = state.pocketRadiusClipping;
    if (val === 0) {
        val = 0.01; // workaround
    }
    var pocketRadiusClipFactor = val / 100;
    var clipRadius = state.pocketRadius * pocketRadiusClipFactor;
    reprs$1.ligandView.pocket.setParameters({ clipRadius: clipRadius });
}
function setPocketColor(state) {
    reprs$1.ligandView.pocket.setParameters({ color: state.pocketColor });
}

// END pocket functions

// checkboxes

function setHydrogenBond(state){
    var val = state.hydrogenBond;
    reprs$1.ligandView.contact.setParameters({
        hydrogenBond: val,
        waterHydrogenBond: val,
        backboneHydrogenBond: val
    });
}

function setHalogenBond(state) {
    reprs$1.ligandView.contact.setParameters({ halogenBond: state.halogenBond });
}

function setHydrophobic(state) {
    reprs$1.ligandView.contact.setParameters({ hydrophobic: state.hydrophobic });
}

function setPiInteraction(state) {
    var val = state.piInteraction;
    reprs$1.ligandView.contact.setParameters({
        cationPi: val,
        piStacking: val
    });
}
function setMetalCoordination(state) {
    reprs$1.ligandView.contact.setParameters({ metalCoordination: state.metalCoordination });
}
// END checkboxes

function setLabel(state) {
    reprs$1.ligandView.label.setVisibility(state.label);
}

function setPolymerDisplay(state) {
    var style = '';
    var ligandStyle = '';
    if (state.polymerDisplay) {
        style = 'backbone';
        ligandStyle = 'ballandstick';
    }
    // update structureView - TODO set state in reducer instead
    nglUi.store.dispatch({ type: SET_STYLE, value: style});
    nglUi.store.dispatch({ type: SET_LIGAND_STYLE, value: ligandStyle});
}

function setDefaultLigandView(state, stage) {
    setLigand$1(state, stage);
}

function update$1() {
    for(var repr in reprs$1.ligandView) {
        reprs$1.ligandView[repr].setVisibility(false);
    }
}

//const file = 'edmaps.js'

var reprs = {};
var mapStyleParams = {
    contour: {
        contour: true,
        flatShaded: false,
        opacity: 1,
        metalness: 0,
        wireframe: false,
        depthWrite: true
    },
    smooth: {
        contour: false,
        flatShaded: false,
        opacity: 0.5,
        metalness: 0,
        wireframe: false,
        depthWrite: false
    },
    flat: {
        contour: false,
        flatShaded: true,
        opacity: 0.3,
        metalness: 0.2,
        wireframe: false,
        depthWrite: false
    }
};

// load/show/hide 2fofc
function set2fofc(state, stage) {
    var map = '2fofc';
    if (state.map2fofc) {
        if (!reprs.surf2fofc) {
            setLoading(true);
            // note: each call to loadFile for map returns new sc instance
            stage.loadFile(edmapsUrl + pdbid + '_' + map + '.dsn6').then(function (sc) {
                init2fofc(sc);
                set2fofcLoaded(state, stage);
                setLoading(false);
            });
        } else {
            set2fofcLoaded(state, stage);
        }
    } else {
        setScroll(state);
        if (reprs.surf2fofc) { reprs.surf2fofc.setVisibility(false); }
    }
}

function set2fofcLoaded(state, stage) {
    var boxSize = state.boxSize;
    var level2fofc = state.level2fofc;
    var mapStyle = state.mapStyle;
    var p = {
        boxSize: boxSize,
        isolevelScroll: true,
        isolevel: level2fofc
    };
    Object.assign(p, mapStyleParams[mapStyle]);
    //u.inspect(p, file + ': set2fofcLoaded: p' )

    reprs.surf2fofc.setParameters(p);
    reprs.surf2fofc.setVisibility(true);

    // update isolevelScroll for other map
    if (reprs.surfFofc) {
        reprs.surfFofc.setParameters({ isolevelScroll: false });
        reprs.surfFofcNeg.setParameters({ isolevelScroll: false });
    }

    nglUi.components.boxSize.setState({ value: boxSize });

    if (state.action.type !== SET_DEFAULT_STRUCTURE_VIEW) {
        updateStructureView(state, stage);
    }
}

// load/show/hide fofc
function setFofc(state, stage) {
    var map = 'fofc';
    if (state.mapFofc) {
        if (!reprs.surfFofc) {
            setLoading(true);
            // note: each call to loadFile for map returns new sc instance
            stage.loadFile(edmapsUrl + pdbid + '_' + map + '.dsn6').then(function (sc) {
                initFofc(sc);
                setFofcLoaded(state, stage);
                setLoading(false);
            });
        } else {
            setFofcLoaded(state, stage);
        }
    } else {
        setScroll(state);
        if (reprs.surfFofc) { reprs.surfFofc.setVisibility(false); }
        if (reprs.surfFofcNeg) { reprs.surfFofcNeg.setVisibility(false); }
    }
}

function setFofcLoaded(state, stage) {
    var boxSize = state.boxSize;
    var levelFofc = state.levelFofc;
    var mapStyle = state.mapStyle;
    var p = {
        boxSize: boxSize,
        isolevelScroll: true,
        isolevel: levelFofc
    };
    Object.assign(p, mapStyleParams[mapStyle]);

    reprs.surfFofc.setParameters(p);
    reprs.surfFofc.setVisibility(true);
    reprs.surfFofcNeg.setParameters(p);
    reprs.surfFofcNeg.setVisibility(true);

    // update isolevelScroll for other map
    if (reprs.surf2fofc) { reprs.surf2fofc.setParameters({ isolevelScroll: false }); }

    nglUi.components.boxSize.setState({ value: boxSize });

    if (state.action.type !== SET_DEFAULT_STRUCTURE_VIEW) {
        updateStructureView(state, stage);
    }
}

function setScroll(state) {
    var scroll = state.scroll;
    if (reprs.surf2fofc) { reprs.surf2fofc.setParameters({ isolevelScroll: (scroll === '2fofc') }); }
    if (reprs.surfFofc) {
        var isolevelScroll = (scroll === 'fofc');
        reprs.surfFofc.setParameters({ isolevelScroll: isolevelScroll });
        reprs.surfFofcNeg.setParameters({ isolevelScroll: isolevelScroll });
    }
}

function set2fofcLevel(state) {
    if (reprs.surf2fofc) {
        var level = parseFloat(state.level2fofc);
        reprs.surf2fofc.setParameters({ isolevel: level });
    }
}

function setFofcLevel(state) {
    if (reprs.surfFofc && reprs.surfFofcNeg) {
        var level = parseFloat(state.levelFofc);
        reprs.surfFofc.setParameters({ isolevel: level });
        reprs.surfFofcNeg.setParameters({ isolevel: level });
    }
}

function setMapStyle(state) {
    var p = mapStyleParams[state.mapStyle];
    if (reprs.surf2fofc) { reprs.surf2fofc.setParameters(p); }
    if (reprs.surfFofc) {
        reprs.surfFofc.setParameters(p);
        reprs.surfFofcNeg.setParameters(p);
    }
}

function setBoxSize(state) {
    var boxSize = state.boxSize;
    if (boxSize === 0) { boxSize = 0.1; } // workaround for boxSize flipping to 100 when range value is zero
    var p = { boxSize: boxSize };
    if (reprs.surf2fofc) { reprs.surf2fofc.setParameters(p); }
    if (reprs.surfFofc) {
        reprs.surfFofc.setParameters(p);
        reprs.surfFofcNeg.setParameters(p);
    }
}

function setLigand$$1(state, stage) {
    var ligand = state.ligand;

    if (ligand === '') {
        update$1(state, stage);
    } else {
        setLigand$1(state, stage); // update ligandView
        updateBoxSize(state);
    }
}

function updateBoxSize(state) {
    setBoxSize(state);
    nglUi.components.boxSize.setState({ value: state.boxSize });
}

// set the default maps view
function setDefaultMapsView(state, stage) {
    update$2(state, stage);
    update$1(state, stage);
    set2fofc(state, stage);
}

function update$$1(state, stage) {
    set2fofc(state, stage);
    setFofc(state, stage);
}

// private funcs ///////////////////////////////////////////////////////////////

function init2fofc(sc) {
    reprs.surf2fofc = sc.addRepresentation('surface', {
        lazy: true,
        visible: false,
        color: 'skyblue',
        useWorker: false,
        contour: true,
        opaqueBack: false,
        isolevelScroll: true
    });
    reprs.surf2fofc.signals.parametersChanged.add(function (p) {
       updateIsolevel(p.isolevel, reprs.surf2fofc, '2fofc');
    });
}
function initFofc(sc) {
    reprs.surfFofc = sc.addRepresentation('surface', {
        lazy: true,
        visible: false,
        color: 'mediumseagreen',
        useWorker: false,
        contour: true,
        opaqueBack: false,
        isolevelScroll: true
    });
    reprs.surfFofcNeg = sc.addRepresentation('surface', {
        lazy: true,
        visible: false,
        color: 'tomato',
        negateIsolevel: true,
        useWorker: false,
        contour: true,
        opaqueBack: false,
        isolevelScroll: true
    });
    reprs.surfFofc.signals.parametersChanged.add(function (p) {
       updateIsolevel(p.isolevel, reprs.surfFofc, 'fofc');
    });
    reprs.surfFofcNeg.signals.parametersChanged.add(function (p) {
       updateIsolevel(p.isolevel, reprs.surfFofcNeg);
    });
}

// limit isolevel to 0.01-10.0
function updateIsolevel (isolevel, repr, map) {
    if (isolevel < 0.01) {
        repr.setParameters({ isolevel: 0.01 });
    } else if (isolevel > 10) {
        repr.setParameters({ isolevel: 10 });
    } else {
        if (map) {
            var name = (map === '2fofc') ? 'level2fofc' : 'levelFofc';
            nglUi.components[name].setState({ value: isolevel.toFixed(1) });
        }
    }
}

function updateStructureView(state, stage) {
    var assembly = (nglUi.isFullStructure) ? 'BU1' : '__AU';
    if (state.assembly !== assembly || state.style !== '' || state.ligandStyle !== '') {
        update$2(state, stage);
    }
}

var setView = function (value) {
    return { type: SET_VIEW, value: value }
};

// structure view
var setAssembly = function (value) {
    return { type: SET_ASSEMBLY, value: value }
};
var setModel = function (value) {
    return { type: SET_MODEL, value: value }
};
var setSymmetry = function (value) {
    return { type: SET_SYMMETRY, value: value }
};
var setStyle = function (value) {
    return { type: SET_STYLE, value: value }
};
var setColorScheme = function (value) {
    return { type: SET_COLOR_SCHEME, value: value }
};
var setLigandStyle = function (value) {
    return { type: SET_LIGAND_STYLE, value: value }
};
var setQuality = function (value) {
    return { type: SET_QUALITY, value: value }
};
var setWaterVisibility = function (value) {
    return { type: SET_WATER_VISIBILITY, value: value }
};
var setIonVisibility = function (value) {
    return { type: SET_ION_VISIBILITY, value: value }
};
var setHydrogenVisibility = function (value) {
    return { type: SET_HYDROGEN_VISIBILITY, value: value }
};
var setClashVisibility = function (value) {
    return { type: SET_CLASH_VISIBILITY, value: value }
};
var setDefaultStructureView = function () {
    return { type: SET_DEFAULT_STRUCTURE_VIEW }
};

// edmaps
var set2fofc$1 = function (value) {
    return { type: SET_2FOFC, value: value }
};
var setFofc$1 = function (value) {
    return { type: SET_FOFC, value: value }
};
var setScroll$1 = function (value) {
    return { type: SET_SCROLL, value: value }
};
var set2fofcLevel$1 = function (value) {
    return { type: SET_2FOFC_LEVEL, value: value }
};
var setFofcLevel$1 = function (value) {
    return { type: SET_FOFC_LEVEL, value: value }
};
var setMapStyle$1 = function (value) {
    return { type: SET_MAP_STYLE, value: value }
};
var setBoxSize$1 = function (value) {
    return { type: SET_BOX_SIZE, value: value }
};
var setDefaultMapsView$1 = function () {
    return { type: SET_DEFAULT_EDMAPS_VIEW }
};
var setEdmapsLigand = function (value) {
    return { type: SET_EDMAPS_LIGAND, value: value }
};

// ligand viewer
var setLigand$2 = function (value) {
    return { type: SET_LIGAND, value: value }
};
var setPocketNearClipping$1 = function (value) {
    return { type: SET_POCKET_NEAR_CLIPPING, value: value }
};
var setPocketRadiusClipping$1 = function (value) {
    return { type: SET_POCKET_RADIUS_CLIPPING, value: value }
};
var setPocketOpacity$1 = function (value) {
    return { type: SET_POCKET_OPACITY, value: value }
};
var setPocketColor$1 = function (value) {
    return { type: SET_POCKET_COLOR, value: value }
};
var setHydrogenBond$1 = function (value) {
    return { type: SET_HYDROGEN_BOND, value: value }
};
var setHalogenBond$1 = function (value) {
    return { type: SET_HALOGEN_BOND, value: value }
};
var setHydrophobic$1 = function (value) {
    return { type: SET_HYDROPHOBIC, value: value }
};
var setPiInteraction$1 = function (value) {
    return { type: SET_PI_INTERACTION, value: value }
};
var setMetalCoordination$1 = function (value) {
    return { type: SET_METAL_COORDINATION, value: value }
};
var setLabel$1 = function (value) {
    return { type: SET_LABEL, value: value }
};
var setPolymerDisplay$1 = function (value) {
    return { type: SET_POLYMER_DISPLAY, value: value }
};
var setDefaultLigandView$1 = function () {
    return { type: SET_DEFAULT_LIGAND_VIEW }
};

// viewer
var setSpin$1 = function () {
    return { type: SET_SPIN }
};
var center$1 = function () {
    return { type: CENTER }
};
var setFullscreen$1 = function () {
    return { type: SET_FULLSCREEN }
};
var screenshot$1 = function () {
    return { type: SCREENSHOT }
};
var setCameraType$1 = function (value) {
    return { type: SET_CAMERA_TYPE, value: value }
};
var setBackground$1 = function (value) {
    return { type: SET_BACKGROUND, value: value }
};
var setFocus$1 = function (value) {
    return { type: SET_FOCUS, value: value }
};

// select group - select with label
var SelectGroup = (function (Component$$1) {
    function SelectGroup () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) SelectGroup.__proto__ = Component$$1;
    SelectGroup.prototype = Object.create( Component$$1 && Component$$1.prototype );
    SelectGroup.prototype.constructor = SelectGroup;

    SelectGroup.prototype.render = function render$$1 () {
        var ref = this.props;
        var onChange = ref.onChange;
        var action = ref.action;
        var label = ref.label;
        var id = ref.id;
        var options = ref.options;
        var selected = ref.selected;
        return (
            preact.h( 'div', { className: 'row horiz-group' },
                preact.h( 'div', { className: 'col-xs-5 label-right' },
                    preact.h( TooltipLabel, {
                            label: label, id: id })
                ),
                preact.h( 'div', { className: 'col-xs-7' },
                    preact.h( Select, { onChange: onChange, action: action, id: id, options: options, selected: selected })
                )
            )
        )
    };

    return SelectGroup;
}(preact.Component));

// select group
var Select = (function (Component$$1) {
    function Select(props) {
        Component$$1.call(this, props);
        this.onChange = props.onChange;
        this.action = props.action;
    }

    if ( Component$$1 ) Select.__proto__ = Component$$1;
    Select.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Select.prototype.constructor = Select;
    Select.prototype.handleChange = function handleChange (e) {
        this.onChange(this.action(e.target.value));
    };
    Select.prototype.render = function render$$1 () {
        var ref = this.props;
        var id = ref.id;
        var options = ref.options;
        var selected = ref.selected;
        var optionsList = getOptionsList(id, options);
        // note: setting the 'selected' attribute on options does not work - set the 'value' attribute on the select element instead
        return (
            preact.h( 'select', { onChange: this.handleChange.bind(this), className: 'form-control input-sm', id: 'select-' + id, value: selected },
                optionsList
            )
        )
    };

    return Select;
}(preact.Component));

function getOptionsList(id, options) {
    var list = [];
    options.forEach(function (option) {
        list.push(preact.h( Option, { option: option }));
    });
    return list
}

// selectGroup option
var Option = (function (Component$$1) {
    function Option () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Option.__proto__ = Component$$1;
    Option.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Option.prototype.constructor = Option;

    Option.prototype.render = function render$$1 () {
        var ref = this.props;
        var option = ref.option;
        return (preact.h( 'option', { value: option.value }, option.label))
    };

    return Option;
}(preact.Component));

// checkbox with label
var CheckboxGroup = (function (Component$$1) {
    function CheckboxGroup () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) CheckboxGroup.__proto__ = Component$$1;
    CheckboxGroup.prototype = Object.create( Component$$1 && Component$$1.prototype );
    CheckboxGroup.prototype.constructor = CheckboxGroup;

    CheckboxGroup.prototype.render = function render$$1 () {
        var ref = this.props;
        var onClick = ref.onClick;
        var action = ref.action;
        var label = ref.label;
        var id = ref.id;
        var checked = ref.checked;
        return (
            preact.h( 'div', { className: 'checkbox-group' },
                preact.h( TooltipLabel, {
                        label: label, id: id }),
                preact.h( Checkbox, {
                        id: id, checked: checked, className: 'checkbox-with-label', onClick: onClick, action: action })
            )
        )
    };

    return CheckboxGroup;
}(preact.Component));

// checkbox
var Checkbox = (function (Component$$1) {
    function Checkbox(props) {
        Component$$1.call(this, props);
        this.onClick = props.onClick;
        this.action = props.action;
    }

    if ( Component$$1 ) Checkbox.__proto__ = Component$$1;
    Checkbox.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Checkbox.prototype.constructor = Checkbox;
    Checkbox.prototype.handleClick = function handleClick (e) {
        this.onClick(this.action(e.target.checked));
    };
    Checkbox.prototype.render = function render$$1 () {
        var ref = this.props;
        var checked = ref.checked;
        var id = ref.id;
        var className = ref.className;
        return (
            preact.h( 'input', { type: 'checkbox', onClick: this.handleClick.bind(this), checked: checked, id: 'checkbox-' + id, className: className })
        )
    };

    return Checkbox;
}(preact.Component));

// radio
var Radio = (function (Component$$1) {
    function Radio(props) {
        Component$$1.call(this, props);
        this.onClick = props.onClick;
        this.action = props.action;
    }

    if ( Component$$1 ) Radio.__proto__ = Component$$1;
    Radio.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Radio.prototype.constructor = Radio;
    Radio.prototype.handleClick = function handleClick (e) {
        this.onClick(this.action(e.target.value));
    };
    Radio.prototype.render = function render$$1 () {
        var ref = this.props;
        var id = ref.id;
        var name = ref.name;
        var value = ref.value;
        var checked = ref.checked;
        return (
            preact.h( 'input', { type: 'radio', id: 'radio-' + id, name: name, value: value, onClick: this.handleClick.bind(this), checked: checked, className: 'ngl-ui-radio' })
        )
    };

    return Radio;
}(preact.Component));

// slider with label
var SliderGroup = (function (Component$$1) {
    function SliderGroup () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) SliderGroup.__proto__ = Component$$1;
    SliderGroup.prototype = Object.create( Component$$1 && Component$$1.prototype );
    SliderGroup.prototype.constructor = SliderGroup;

    SliderGroup.prototype.render = function render$$1 () {
        var ref = this.props;
        var label = ref.label;
        var onInput = ref.onInput;
        var action = ref.action;
        var id = ref.id;
        var attrs = ref.attrs;
        var disabled = ref.disabled;
        var labelColWidth = 6; // default
        var rangeColWidth = 6; // default
        if (this.props.rangeColWidth) {
            rangeColWidth = this.props.rangeColWidth;
            labelColWidth = 12 - rangeColWidth;
        }
        var style = disabled ? {opacity:0.5} : null;
        return (
            preact.h( 'div', { className: 'row horiz-group', style: style },
                preact.h( 'div', { className: 'col-xs-' + labelColWidth + ' label-right' },
                    preact.h( TooltipLabel, {
                            label: label, id: id })
                ),
                preact.h( 'div', { className: 'col-xs-' + rangeColWidth },
                    preact.h( Slider, { onInput: onInput, action: action, id: id, attrs: attrs, disabled: disabled })
                )
            )
        )
    };

    return SliderGroup;
}(preact.Component));

// slider with value display
var Slider = (function (Component$$1) {
    function Slider(props) {
        Component$$1.call(this, props);
        var ref = this.props;
        var id = ref.id;
        var onInput = ref.onInput;
        var action = ref.action;
        var attrs = ref.attrs;
        this.id = id;
        this.onInput = onInput;
        this.action = action;
        this.min = (attrs && attrs.min) ? attrs.min : 0;
        this.max = (attrs && attrs.max) ? attrs.max : 100;
        this.step = (attrs && attrs.step) ? attrs.step : 1;
        var value = (attrs && attrs.value) ? attrs.value : 0;
        this.state.value = (id === 'level2fofc' || id === 'levelFofc') ? value.toFixed(1) : value;
        nglUi.components[id] = this;
    }

    if ( Component$$1 ) Slider.__proto__ = Component$$1;
    Slider.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Slider.prototype.constructor = Slider;
    Slider.prototype.handleInput = function handleInput (e) {
        var value = (this.id === 'level2fofc' || this.id === 'levelFofc')
            ? parseFloat(e.target.value).toFixed(1) : parseInt(e.target.value);
        this.setState({ value: value });
        this.onInput(this.action(value));
    };
    Slider.prototype.render = function render$$1 () {
        var ref = this.state;
        var value = ref.value;
        var ref$1 = this.props;
        var disabled = ref$1.disabled; // TODO disabled should be in this.state
        var ref$2 = this;
        var id = ref$2.id;
        var max = ref$2.max;
        var min = ref$2.min;
        var step = ref$2.step;
        var offset = (id === 'level2fofc' || id === 'levelFofc') ? 8 : (value < 10) ? 4 : 6;
        var left = (nglUi[id + 'Width']) ? 9 + (nglUi[id + 'Width'] - 18) * value / max - offset : 1;
        var style = { left: left };
        return (
            preact.h( 'div', { className: 'inputRange' },
                preact.h( 'input', { id: id + 'Range', type: 'range', min: min, max: max, value: value, step: step, onInput: this.handleInput.bind(this), disabled: disabled }),
                preact.h( 'div', { id: id + 'Value', style: style }, value)
            )
        )
    };

    return Slider;
}(preact.Component));

// button placed align-right in a single row
var ButtonRow = (function (Component$$1) {
    function ButtonRow () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) ButtonRow.__proto__ = Component$$1;
    ButtonRow.prototype = Object.create( Component$$1 && Component$$1.prototype );
    ButtonRow.prototype.constructor = ButtonRow;

    ButtonRow.prototype.render = function render$$1 () {
        var ref = this.props;
        var onClick = ref.onClick;
        var action = ref.action;
        var name = ref.name;
        var id = ref.id;
        var cls = ref.cls;
        return (
            preact.h( 'div', { className: 'text-right' },
                preact.h( Button, { name: name, id: id, cls: cls, onClick: onClick, action: action })
            )
        )
    };

    return ButtonRow;
}(preact.Component));

// button with tooltip
var Button = (function (Component$$1) {
    function Button(props) {
        Component$$1.call(this, props);
        this.onClick = props.onClick;
        this.action = props.action;
    }

    if ( Component$$1 ) Button.__proto__ = Component$$1;
    Button.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Button.prototype.constructor = Button;
    Button.prototype.handleClick = function handleClick (e) {
        this.onClick(this.action());
    };
    Button.prototype.render = function render$$1 () {
        var ref = this.props;
        var name = ref.name;
        var id = ref.id;
        var cls = ref.cls;
        return (
            preact.h( 'button', { id: id, className: cls ? cls : 'off', onClick: this.handleClick.bind(this) },
                preact.h( 'span', null, name ), preact.h( Tooltip, { id: id })
            )
        )
    };

    return Button;
}(preact.Component));

// label with tooltip
var TooltipLabel = (function (Component$$1) {
    function TooltipLabel () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) TooltipLabel.__proto__ = Component$$1;
    TooltipLabel.prototype = Object.create( Component$$1 && Component$$1.prototype );
    TooltipLabel.prototype.constructor = TooltipLabel;

    TooltipLabel.prototype.render = function render$$1 () {
        var ref = this.props;
        var label = ref.label;
        var id = ref.id;
        return (
            preact.h( 'span', null, label, preact.h( Tooltip, { id: id }) )
        )
    };

    return TooltipLabel;
}(preact.Component));

// tooltip
var Tooltip = (function (Component$$1) {
    function Tooltip () {
        Component$$1.apply(this, arguments);
    }

    if ( Component$$1 ) Tooltip.__proto__ = Component$$1;
    Tooltip.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Tooltip.prototype.constructor = Tooltip;

    Tooltip.prototype.render = function render$$1 () {
        var ref = this.props;
        var id = ref.id;
        return (
            preact.h( 'span', { className: 'fa fa-question-circle ngl-ui-help', 'data-toggle': 'tooltip', 'data-placement': 'top', title: tooltips[id] })
        )
    };

    return Tooltip;
}(preact.Component));

// structure view panel
var StructureView = (function (Component$$1) {
    function StructureView(props) {
        Component$$1.call(this, props);
    }

    if ( Component$$1 ) StructureView.__proto__ = Component$$1;
    StructureView.prototype = Object.create( Component$$1 && Component$$1.prototype );
    StructureView.prototype.constructor = StructureView;

    StructureView.prototype.render = function render$$1 () {
        var store = this.props.store;
        var s = store.getState();
        var style = (s.view === STRUCTURE_VIEW || nglUi.debug === 2) ? 'display: block' : 'display: none';
        return (
            preact.h( 'div', { id: STRUCTURE_VIEW, className: 'controls', style: style },
                preact.h( 'div', { className: 'help-page' }, preact.h( 'a', { href: '/pages/help/3dview#structure-view', target: '_blank' }, "Structure View Documentation")),
                preact.h( 'br', null ),
                preact.h( SelectGroup, {
                        label: 'Assembly', id: 'assembly', options: s.options.assembly, selected: s.assembly, onChange: store.dispatch, action: setAssembly }),
                preact.h( SelectGroup, {
                        label: 'Model', id: 'model', options: s.options.model, selected: s.model, onChange: store.dispatch, action: setModel }),
                preact.h( SelectGroup, {
                        label: 'Symmetry', id: 'symmetry', options: s.options.symmetry, selected: s.symmetry, onChange: store.dispatch, action: setSymmetry }),
                preact.h( SelectGroup, {
                        label: 'Style', id: 'style', options: s.options.style, selected: s.style, onChange: store.dispatch, action: setStyle }),
                preact.h( SelectGroup, {
                        label: 'Color', id: 'colorScheme', options: s.options.colorScheme, selected: s.colorScheme, onChange: store.dispatch, action: setColorScheme }),
                preact.h( SelectGroup, {
                        label: 'Ligand', id: 'ligandStyle', options: s.options.ligandStyle, selected: s.ligandStyle, onChange: store.dispatch, action: setLigandStyle }),
                preact.h( SelectGroup, {
                        label: 'Quality', id: 'quality', options: s.options.quality, selected: s.quality, onChange: store.dispatch, action: setQuality }),
                preact.h( 'div', { className: 'row horiz-group' },
                    preact.h( 'div', { className: 'col-xs-6' },
                        preact.h( CheckboxGroup, {
                                label: 'Water', id: 'water', checked: s.waterVisibility ? 'checked' : '', onClick: store.dispatch, action: setWaterVisibility })
                    ),
                    preact.h( 'div', { className: 'col-xs-6' },
                        preact.h( CheckboxGroup, {
                                label: 'Ions', id: 'ion', checked: s.ionVisibility ? 'checked' : '', onClick: store.dispatch, action: setIonVisibility })
                    )
                ),
                preact.h( 'div', { className: 'row horiz-group' },
                    preact.h( 'div', { className: 'col-xs-6' },
                        preact.h( CheckboxGroup, {
                                label: 'Hydrogens', id: 'hydrogen', checked: s.hydrogenVisibility ? 'checked' : '', onClick: store.dispatch, action: setHydrogenVisibility })
                    ),
                    preact.h( 'div', { className: 'col-xs-6' },
                        nglUi.hasValidationReport && !nglUi.reduced &&
                            preact.h( CheckboxGroup, {
                                    label: 'Clashes', id: 'clash', checked: s.clashVisibility ? 'checked' : '', onClick: store.dispatch, action: setClashVisibility })
                    )
                ),
                preact.h( 'div', { className: 'text-right' },
                    preact.h( Button, {
                            name: 'Default Structure View', id: 'btnDefaultStructureView', onClick: store.dispatch, action: setDefaultStructureView })
                )
            )
        )
    };

    return StructureView;
}(preact.Component));

var EDMaps = (function (Component$$1) {
    function EDMaps(props) {
        Component$$1.call(this, props);
    }

    if ( Component$$1 ) EDMaps.__proto__ = Component$$1;
    EDMaps.prototype = Object.create( Component$$1 && Component$$1.prototype );
    EDMaps.prototype.constructor = EDMaps;

    EDMaps.prototype.render = function render$$1 () {
        var store = this.props.store;
        var s = store.getState();
        var style = (s.view === EDMAPS_VIEW || nglUi.debug === 2) ? 'display: block' : 'display: none';
        var isolevel2fofcAttrs = { max: 10, value: s.level2fofc, step: 0.1 };
        var isolevelFofcAttrs = { max: 10, value: s.levelFofc, step: 0.1 };
        var boxSizeAttrs = { value: s.boxSize };
        if (nglUi.hasEdmaps) {
            return (
                preact.h( 'div', { id: EDMAPS_VIEW, className: 'controls', style: style },
                    preact.h( 'div', { className: 'help-page' }, preact.h( 'a', { href: '/pages/help/3dview#edmaps-view', target: '_blank' }, "Electron Density Maps Documentation")),
                    preact.h( 'br', null ),
                    preact.h( 'div', { className: 'row edmaps' },
                        preact.h( 'div', { className: 'col-xs-5' }),
                        preact.h( 'div', { className: 'col-xs-3 map-name' }, "2fo-fc"),
                        preact.h( 'div', { className: 'col-xs-3 map-name' }, "fo-fc")
                    ),
                    preact.h( 'div', { className: 'row edmaps' },
                        preact.h( 'div', { className: 'col-xs-5 label-right' },
                            preact.h( TooltipLabel, {
                                    label: 'Map', id: 'map' })
                        ),
                        preact.h( 'div', { className: 'col-xs-3' },
                            preact.h( Checkbox, {
                                    id: '2fofc', checked: s.map2fofc, onClick: store.dispatch, action: set2fofc$1 })
                        ),
                        preact.h( 'div', { className: 'col-xs-3' },
                            preact.h( Checkbox, {
                                    id: 'fofc', checked: s.mapFofc, onClick: store.dispatch, action: setFofc$1 })
                        )
                    ),
                    preact.h( 'div', { className: 'row edmaps' },
                        preact.h( 'div', { className: 'col-xs-5 label-right' },
                            preact.h( TooltipLabel, {
                                    label: 'Scroll', id: 'scroll' })
                        ),
                        preact.h( 'div', { className: 'col-xs-3' },
                            preact.h( Radio, {
                                    id: 'scroll-2fofc', name: 'scroll', checked: s.scroll === '2fofc', value: '2fofc', onClick: store.dispatch, action: setScroll$1 })
                        ),
                        preact.h( 'div', { className: 'col-xs-3' },
                            preact.h( Radio, {
                                    id: 'scroll-fofc', name: 'scroll', checked: s.scroll === 'fofc', value: 'fofc', onClick: store.dispatch, action: setScroll$1 })
                        )
                    ),
                    preact.h( SliderGroup, {
                            label: '2fo-fc Level', id: 'level2fofc', onInput: store.dispatch, action: set2fofcLevel$1, rangeColWidth: '7', attrs: isolevel2fofcAttrs, disabled: !s.map2fofc }),
                    preact.h( SliderGroup, {
                            label: 'fo-fc Level', id: 'levelFofc', onInput: store.dispatch, action: setFofcLevel$1, rangeColWidth: '7', attrs: isolevelFofcAttrs, disabled: !s.mapFofc }),
                    preact.h( 'div', { className: 'vspace-20' }),
                    preact.h( SelectGroup, {
                            label: 'Map Style', id: 'mapStyle', options: s.options.mapStyle, selected: s.mapStyle, onChange: store.dispatch, action: setMapStyle$1 }),
                    preact.h( SliderGroup, {
                            label: 'Map Size', id: 'boxSize', onInput: store.dispatch, action: setBoxSize$1, rangeColWidth: '7', attrs: boxSizeAttrs, disabled: !(s.map2fofc || s.mapFofc) }),
                    nglUi.hasLigand &&
                        preact.h( SelectGroup, {
                            label: 'Ligand', id: 'ligandEdmaps', options: s.options.ligand, selected: s.ligand, onChange: store.dispatch, action: setEdmapsLigand }),

                    preact.h( 'div', { className: 'vspace-20' }),

                    preact.h( ButtonRow, {
                            name: 'Default EDMaps View', id: 'btnDefaultMapsView', onClick: store.dispatch, action: setDefaultMapsView$1 })
                )
            )
        } else {
            return (
                preact.h( 'div', { id: EDMAPS_VIEW, className: 'controls', style: style },
                    preact.h( 'div', { className: 'help-page' }, preact.h( 'a', { href: '/pages/help/3dview#edmaps-view', target: '_blank' }, "Electron Density Maps Documentation")),
                    preact.h( 'br', null ),
                    preact.h( 'div', { class: 'message' }, 'There are no electron density maps for structure ' + pdbidUc)
                )
            )
        }
    };

    return EDMaps;
}(preact.Component));

var messages = {
    begin:  'To begin select a ligand from the dropdown list.',
    pocket: 'The ligand pocket is only visible if the opacity is set to greater than zero.'
};

// ligand viewer panel
var LigandView = (function (Component$$1) {
    function LigandView(props) {
        Component$$1.call(this, props);
    }

    if ( Component$$1 ) LigandView.__proto__ = Component$$1;
    LigandView.prototype = Object.create( Component$$1 && Component$$1.prototype );
    LigandView.prototype.constructor = LigandView;

    LigandView.prototype.render = function render$$1 () {
        var store = this.props.store;
        var s = store.getState();
        var style = (s.view === LIGAND_VIEW || nglUi.debug === 2) ? 'display: block' : 'display: none';
        if (nglUi.debug === 2) { style += '; position: absolute; left: 275px; top: 46px; width: 262px;'; }
        if (nglUi.hasLigand) {
            var message = (s.ligand === '') ?  messages.begin : messages.pocket;
            var pocketRadiusClippingAttrs = { value: s.pocketRadiusClipping };
            return (
                preact.h( 'div', { id: LIGAND_VIEW, className: 'controls', style: style },
                    preact.h( 'div', { className: 'help-page' }, preact.h( 'a', { href: '/pages/help/3dview#ligand-viewer', target: '_blank' }, "Ligand View Documentation")),
                    preact.h( 'br', null ),
                    preact.h( 'div', { id: 'ligandViewMessage', className: 'message' },
                        message
                    ),
                    preact.h( SelectGroup, {
                            label: 'Ligand', id: 'ligandViewLigand', options: s.options.ligand, selected: s.ligand, onChange: store.dispatch, action: setLigand$2 }),

                    preact.h( 'div', { id: 'ligandViewControls', style: s.ligand === '' ? 'display: none;' : 'display: block;' },

                        preact.h( 'hr', null ),

                        preact.h( 'div', { className: 'pocketLabel' }, "Pocket"),

                        preact.h( SliderGroup, {
                                label: 'Opacity', id: 'pocketOpacity', onInput: store.dispatch, action: setPocketOpacity$1, disabled: false }),
                        preact.h( SliderGroup, {
                                label: 'Near Clipping', id: 'pocketNearClipping', onInput: store.dispatch, action: setPocketNearClipping$1, disabled: false }),
                        preact.h( SliderGroup, {
                                label: 'Radius Clipping', id: 'pocketRadiusClipping', onInput: store.dispatch, attrs: pocketRadiusClippingAttrs, action: setPocketRadiusClipping$1, disabled: false }),

                        preact.h( 'div', { className: 'vspace-10' }),

                        preact.h( SelectGroup, {
                                label: 'Color', id: 'pocketColor', options: s.options.pocketColor, selected: s.pocketColor, onChange: store.dispatch, action: setPocketColor$1 }),

                        preact.h( 'hr', null ),

                        preact.h( CheckboxGroup, {
                                label: 'Hydrogen Bonds (blue)', id: 'hydrogenBond', checked: s.hydrogenBond ? 'checked' : '', onClick: store.dispatch, action: setHydrogenBond$1 }),
                        preact.h( CheckboxGroup, {
                                label: 'Halogen Bonds (turquoise)', id: 'halogenBond', checked: s.halogenBond ? 'checked' : '', onClick: store.dispatch, action: setHalogenBond$1 }),
                        preact.h( CheckboxGroup, {
                                label: 'Hydrophobic Contacts (grey)', id: 'hydrophobic', checked: s.hydrophobic ? 'checked' : '', onClick: store.dispatch, action: setHydrophobic$1 }),
                        preact.h( CheckboxGroup, {
                                label: 'Pi Interactions (orange, green)', id: 'piInteraction', checked: s.piInteraction ? 'checked' : '', onClick: store.dispatch, action: setPiInteraction$1 }),
                        preact.h( CheckboxGroup, {
                                label: 'Metal Interactions (purple)', id: 'metalCoordination', checked: s.metalCoordination ? 'checked' : '', onClick: store.dispatch, action: setMetalCoordination$1 }),

                        preact.h( 'div', { className: 'vspace-10' }),

                        preact.h( CheckboxGroup, {
                                label: 'Label', id: 'label', onClick: store.dispatch, checked: s.label ? 'checked' : '', action: setLabel$1 }),
                        preact.h( CheckboxGroup, {
                                label: 'Polymer Display', id: 'polymerDisplay', onClick: store.dispatch, checked: s.polymerDisplay ? 'checked' : '', action: setPolymerDisplay$1 }),

                        preact.h( 'div', { className: 'vspace-10' })
                    ),
                    preact.h( ButtonRow, {
                            name: 'Default Ligand View', id: 'btnDefaultLigandView', onClick: store.dispatch, action: setDefaultLigandView$1 })

                )
            )
        } else {
            var html = 'There are no ligands to view for structure ' + pdbidUc;
            return (
                preact.h( 'div', { id: LIGAND_VIEW, className: 'controls', style: style },
                    preact.h( 'div', { class: 'message' }, html)
                )
            )
        }
    };

    return LigandView;
}(preact.Component));

var NglControls = (function (Component$$1) {
    function NglControls(props) {
        Component$$1.call(this, props);
        nglUi.components.nglControls = this;
    }

    if ( Component$$1 ) NglControls.__proto__ = Component$$1;
    NglControls.prototype = Object.create( Component$$1 && Component$$1.prototype );
    NglControls.prototype.constructor = NglControls;

    NglControls.prototype.handleClick = function handleClick (e) {
        console.log('NglControls: e.target.id=' + e.target.id);
        this.props.store.dispatch(setView(e.target.id.replace('Tab', '')));
    };

    NglControls.prototype.render = function render$$1 () {
        var store = this.props.store;
        var view = store.getState().view;

        return (
            preact.h( 'div', null,
                preact.h( 'div', { id: 'controls-tabs' },
                    preact.h( 'div', {    id: STRUCTURE_VIEW + 'Tab', className: view === STRUCTURE_VIEW ? 'tab-active' : 'tab-inactive', onClick: this.handleClick.bind(this) }, "Structure", preact.h( 'br', null ), "View"),
                    preact.h( 'div', {    id: EDMAPS_VIEW + 'Tab', className: view === EDMAPS_VIEW ? 'tab-active' : 'tab-inactive', onClick: this.handleClick.bind(this) }, "Electron", preact.h( 'br', null ), "Density Maps"),
                    preact.h( 'div', {    id: LIGAND_VIEW + 'Tab', className: view === LIGAND_VIEW ? 'tab-active' : 'tab-inactive', onClick: this.handleClick.bind(this) }, "Ligand", preact.h( 'br', null ), "View")
                ),
                preact.h( StructureView, { store: store }),
                preact.h( EDMaps, { store: store }),
                preact.h( LigandView, { store: store })
            )
        )
    };

    return NglControls;
}(preact.Component));

// viewer panel
var Viewer = (function (Component$$1) {
    function Viewer(props) {
        Component$$1.call(this, props);
        nglUi.components.viewer = this;
    }

    if ( Component$$1 ) Viewer.__proto__ = Component$$1;
    Viewer.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Viewer.prototype.constructor = Viewer;

    Viewer.prototype.render = function render$$1 () {
        var store = this.props.store;
        var s = store.getState();
        return (
            preact.h( 'div', null,
                preact.h( Button, {
                        name: 'Spin', id: 'spin', onClick: store.dispatch, action: setSpin$1, cls: s.spin ? 'on' : 'off' }),
                preact.h( Button, {
                        name: 'Center', id: 'center', onClick: store.dispatch, action: center$1 }),
                !nglUi.isSafariMobile &&
                    preact.h( 'span', null,
                        preact.h( Button, {
                                name: 'Fullscreen', id: 'fullscreen', onClick: store.dispatch, action: setFullscreen$1, cls: s.fullscreen ? 'on' : 'off' }),
                        preact.h( Button, {
                                name: 'Screenshot', id: 'screenshot', onClick: store.dispatch, action: screenshot$1 })
                    ),
                preact.h( 'div', { className: 'inline' },
                    preact.h( Select, {
                            id: 'cameraType', options: s.options.cameraType, selected: s.cameraType, onChange: store.dispatch, action: setCameraType$1 })
                ),
                preact.h( 'div', { className: 'inline' },
                    preact.h( Select, {
                            id: 'background', options: s.options.background, selected: s.background, onChange: store.dispatch, action: setBackground$1 })
                ),
                preact.h( 'div', { className: 'inline' },
                    preact.h( 'div', { className: 'inline viewer-focus-label' },
                        preact.h( TooltipLabel, {
                                label: 'Focus', id: 'focus' })
                    ),
                    preact.h( 'div', { className: 'inline viewer-focus-slider' },
                        preact.h( Slider, {
                                id: 'focus', onInput: store.dispatch, action: setFocus$1 })
                    )
                )
            )
        )
    };

    return Viewer;
}(preact.Component));

// entry point for ngl-ui 3d view component
// note: pdbid, bionumber, preset, sele, structureData, blob, stage, initNglUi, and nglUiResize are declared in ngl-ui.pug
//

var file = 'ngl-ui.jsx';
console.log(file + ': NGL.Version=' + NGL.Version);

var nglUi = {}; // container for data and objs independent of state - do not use nglUi.initState<view> as param in Object.assign statements - this leads to the initState being corrupted - instead use util.getInitState() to obtain a clone of the object

// called after ngl.js, ngl-ui.js and blob loaded
initNglUi = function() {
    console.log(file + ': initNglUi: ' + (Date.now() - startTime) + 'ms after startTime');

    stage.loadFile(blob, {ext: "mmtf", defaultRepresentation: false}).then( function(sc) {

        var sd                    = structureData;
        var structure             = sc.structure;
        var biomolDict            = structure.biomolDict;

        var init                  = true;
        var symmetryData          = getSymmetryData(sd.symmetry);
        var hasEdmaps             = sd.hasEdMaps;
        var hasValidationReport   = sd.hasValidationReport;
        var isFullStructure       = (!structure.unitcell && Object.keys(biomolDict).length === 1 && biomolDict['BU1'] && biomolDict['BU1'].isIdentity(structure));
        var assembly              = (isFullStructure) ? 'BU1' : bionumber2assembly(bionumber); // __AU|BU<n>|UNITCELL|SUPERCELL
        var counts                = getCounts(sc);
        var atomCount             = counts.atomCount;
        var instanceCount         = counts.instanceCount;
        var backboneOnly          = structure.atomStore.count / structure.residueStore.count < 2;
        var mobile                = typeof window !== 'undefined' ? typeof window.orientation !== 'undefined' : false;
        var ua                    = navigator.userAgent;
        var isSafariMobile        = ( ua.indexOf('AppleWebKit') !== -1 &&
                                       (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1));
        var sizeScore             = getSizeScore(atomCount, mobile, backboneOnly);
        var scaleFactor           = getScaleFactor$$1(sizeScore, instanceCount, backboneOnly);

        sc.defaultAssembly = assembly;
        console.log(file + ': initNglUi: sc.defaultAssembly=' + sc.defaultAssembly + ' (' + assembly + ')');

        // assign properties to nglUi obj
        Object.assign(nglUi, { preset: preset, sele: sele, debug: debug, reduced: reduced, sc: sc, init: init, symmetryData: symmetryData, hasEdmaps: hasEdmaps, hasValidationReport: hasValidationReport, isFullStructure: isFullStructure, isSafariMobile: isSafariMobile, sizeScore: sizeScore, scaleFactor: scaleFactor });

        nglUi.components          = {}; // jsx components

        // define initial states of the views - these will be used to return individual view to its default state
        nglUi.initStateStructureView  = {
            assembly:             assembly,
            model:                0,
            symmetry:             -1,
            style:                getDefaultStyle(sizeScore),
            colorScheme:          getDefaultColorScheme(sizeScore),
            ligandStyle:          'ballandstick',
            quality:              'auto',
            waterVisibility:      false,
            ionVisibility:        true,
            hydrogenVisibility:   true,
            clashVisibility:      false
        };
        nglUi.initStateEdmaps = {
            map2fofc:             false,
            level2fofc:           0, // 1.5 default value is in constants.js
            mapFofc:              false,
            levelFofc:            0, // 3 default value is in constants.js
            scroll:               '',
            mapStyle:             'contour',
            boxSize:              0 // 20 default value is in constants.js
        };
        nglUi.initStateLigandView = {
            ligand:               '',
            pocketOpacity:        0,
            pocketNearClipping:   0,
            pocketRadiusClipping: 100,
            pocketColor:          'hydrophobicity',
            hydrogenBond:         true,
            halogenBond:          true,
            hydrophobic:          true,
            piInteraction:        true,
            metalCoordination:    true,
            label:                true,
            polymerDisplay:       false
        };
        nglUi.initStateViewer = {
            spin: false,
            fullscreen: false,
            focus: 0,
            cameraType: 'perspective',
            background: 'white'
        };

        var options = getOptions(assembly);
        nglUi.hasLigand = options.ligand.length > 0;

        initReprs();

        // set view to c.STRUCTURE_VIEW by default
        var initState = Object.assign( getInitStateAll(), { options: options, view: STRUCTURE_VIEW });

        // preset logic
        if (preset === SYMMETRY) {
            if (!sele || sele === '') { sele = getFirstSymmetry(options.symmetry); }
            initState.symmetry = getSymmetryFromSele(options.symmetry, sele);
            initNglUi2(initState);
        } else if (preset === VALIDATION_REPORT  && nglUi.hasValidationReport) {
            initState.clashVisibility = true;
            initState.colorScheme = 'geoquality';
            // load validation data
            load(initState, stage, initNglUi2);
        } else if (preset === LIGAND_INTERACTION && nglUi.hasLigand) {
            initState.ligand = (sele === '') ? options.ligand[1].value : getLigandFromSele(options.ligand, sele);
            initState.view = LIGAND_VIEW;
            initNglUi2(initState);
        } else if (preset === ELECTRON_DENSITY_MAPS && nglUi.hasEdmaps) {
            initState.view = EDMAPS_VIEW;
            initNglUi2(initState);
        } else {
            initNglUi2(initState);
        }
    });
};

// called after additional resources are loaded if required, or directly from initNglUi
function initNglUi2(initState) {
    inspect(nglUi, 'nglUi in ' + file);
    //u.inspect(initState, 'initState in ' + file)

    // create store with initial props
    var store = redux.createStore(app, initState);
    nglUi.store = store;

    store.subscribe(function () { updateNglUi(store.getState()); }); // called whenever state changes

    // render controls
    preact.render(preact.h( NglControls, { store: store }), document.getElementById('nglControls'));
    preact.render(preact.h( Viewer, { store: store }), document.getElementById('viewer'));

    var state = store.getState();
    inspect(state, 'state in ' + file);

    // render view
    if (state.view === LIGAND_VIEW) { store.dispatch({ type: SET_LIGAND, value: state.ligand }); }
    else if (state.view === EDMAPS_VIEW) { store.dispatch({ type: SET_DEFAULT_EDMAPS_VIEW }); }
    else { store.dispatch({ type: SET_STRUCTURE_VIEW }); }

    // hide loading message
    setLoading(false);
    initUi();

    // update focus slider whenever the stage parameters change
    stage.signals.parametersChanged.add(function (p) {
        console.log('clipNear=' + p.clipNear);
        var focus = Math.max(0, 4 * p.clipNear - 100);
        nglUi.components.focus.setState({value: focus});
    });
}

resizeNglUi = function(id, w) {
    nglUi[id + 'Width'] = parseInt(w);
    if (nglUi.components[id]) { nglUi.components[id].setState(); }
};

// this function is called whenever state is changed in store - see store.subscribe()
function updateNglUi(state) {
    //u.inspect(state, file + ': state in updateNglUi')
    var type = state.action.type;

    if (type === SET_VIEW) {
        console.log('setView=' + state.view);
    }

    // structure view
    else if (    type === SET_STRUCTURE_VIEW ||
            type === SET_ASSEMBLY ||
            type === SET_MODEL ||
            type === SET_SYMMETRY ||
            type === SET_STYLE ||
            type === SET_COLOR_SCHEME ||
            type === SET_LIGAND_STYLE ||
            type === SET_QUALITY ||
            type === SET_WATER_VISIBILITY ||
            type === SET_ION_VISIBILITY ||
            type === SET_HYDROGEN_VISIBILITY ||
            type === SET_CLASH_VISIBILITY ||
            type === SET_DEFAULT_STRUCTURE_VIEW) {
        update$2(state, stage);
    }

    // edmaps
    else if (type === SET_2FOFC) { set2fofc(state, stage); }
    else if (type === SET_FOFC) { setFofc(state, stage); }
    else if (type === SET_SCROLL) { setScroll(state, stage); }
    else if (type === SET_2FOFC_LEVEL) { set2fofcLevel(state, stage); }
    else if (type === SET_FOFC_LEVEL) { setFofcLevel(state, stage); }
    else if (type === SET_MAP_STYLE) { setMapStyle(state, stage); }
    else if (type === SET_BOX_SIZE) { setBoxSize(state, stage); }
    else if (type === SET_EDMAPS_LIGAND) { setLigand$$1(state, stage); }
    else if (type === SET_DEFAULT_EDMAPS_VIEW) { setDefaultMapsView(state, stage); }

    // ligand viewer
    else if (type === SET_LIGAND) { setLigand$1(state, stage); }
    else if (type === SET_POCKET_OPACITY) { setPocketOpacity(state); }
    else if (type === SET_POCKET_NEAR_CLIPPING) { setPocketNearClipping(state); }
    else if (type === SET_POCKET_RADIUS_CLIPPING) { setPocketRadiusClipping(state); }
    else if (type === SET_POCKET_COLOR) { setPocketColor(state); }
    else if (type === SET_HYDROGEN_BOND) { setHydrogenBond(state); }
    else if (type === SET_HALOGEN_BOND) { setHalogenBond(state); }
    else if (type === SET_HYDROPHOBIC) { setHydrophobic(state); }
    else if (type === SET_PI_INTERACTION) { setPiInteraction(state); }
    else if (type === SET_METAL_COORDINATION) { setMetalCoordination(state); }
    else if (type === SET_LABEL) { setLabel(state); }
    else if (type === SET_POLYMER_DISPLAY) { setPolymerDisplay(state, stage); }
    else if (type === SET_DEFAULT_LIGAND_VIEW) { setDefaultLigandView(state, stage); }

    // viewer
    else if (type === SET_SPIN) { setSpin(state, stage); }
    else if (type === CENTER) { center(stage); }
    else if (type === SET_FULLSCREEN) { setFullscreen(state, stage); }
    else if (type === SCREENSHOT) { screenshot(stage); }
    else if (type === SET_CAMERA_TYPE) { setCameraType(state, stage); }
    else if (type === SET_BACKGROUND) { setBackground(state, stage); }
    else if (type === SET_FOCUS) { setFocus(state, stage); }

    else { toJsonStr(state.action); }

    if (state.autoView !== -1) { stage.tasks.onZeroOnce(function () {
        console.log(file + ': updateNglUi: sc.defaultAssembly=' + nglUi.sc.defaultAssembly);
        stage.autoView(state.autoView);
        nglUi.sc.autoView();
        //stage.autoView(state.autoView)

        if (nglUi.init) {
            console.log('~~~~~~~~~~ updateNglUi: ' + (Date.now() - startTime) + 'ms after startTime');
            nglUi.init = false; // only interested in this on initial page load
        }
    }); }

    nglUi.components.nglControls.setState();
    nglUi.components.viewer.setState();
}

/* the following functions are only called once to initialize the nglUi obj */

// process process symmetry data from new rest service
/*
    return values:
        type: global, pseudo and local
        for any of them the possible values are:
            Cn (n>0) cyclic
            Dn (n>1) dihedral
            T tetrahedral
            O octahedral
            I icosahedral
            H helical
*/
function getSymmetryData(symmetry) {
    var symmetryData = {};
    if (symmetry && symmetry.length > 0) {
        symmetry.forEach( function (item) {
            var assemblyName = (item.biologicalAssemblyId === 0) ? '__AU' : 'BU' + item.biologicalAssemblyId;
            var symmetries = [];
            if (item.localSymmetry) {
                // note: for local symmetries, there may be multiple instances of the same symmetry, so label them 'C3 (local)(1)...(n)'
                var symmetryMap = {};
                item.localSymmetry.forEach( function (obj) {
                    var symmetry = obj.symmetry; // C2, C3 ...
                    if (symmetry !== 'C1') {
                        var o = {
                                label: (symmetry + " (local)"),
                                axes: obj.symmetryAxes
                        };
                        symmetries.push(o);
                        if (!symmetryMap[symmetry]) {
                            symmetryMap[symmetry] = [];
                        }
                        symmetryMap[symmetry].push(o);
                    }
                });
                // append numeric counter to label if there are multiple instances of the same symmetry
                for (var prop in symmetryMap) {
                    var o = symmetryMap[prop];
                    if (o.length > 1) {
                        o.forEach( function (item, i) { item.label += " (" + (i + 1) + ")"; });
                    }
                }
            }
            if (item.globalSymmetry && item.globalSymmetry.symmetry !== 'C1') {
                symmetries.push({
                    label: item.globalSymmetry.symmetry + ' (global)',
                    axes: item.globalSymmetry.symmetryAxes});
            }
            if (item.pseudoSymmetry && item.pseudoSymmetry.symmetry !== 'C1') {
                symmetries.push({
                    label: item.pseudoSymmetry.symmetry + ' (pseudo)',
                    axes: item.pseudoSymmetry.symmetryAxes});
            }
            if (symmetries.length > 0) {
                //toJsonStr(symmetries)
                symmetryData[assemblyName] = { symmetries: symmetries };
            }
        });
    }
    return symmetryData
}

// get atomCount, instanceCount and return in obj
function getCounts(sc) {
    var structure = sc.structure;
    var biomolDict = structure.biomolDict;
    var atomCount, instanceCount;
    if (biomolDict.BU1) {
        var assembly = biomolDict.BU1;
        atomCount = assembly.getAtomCount(structure);
        instanceCount = assembly.getInstanceCount();
    } else {
        atomCount = structure.getModelProxy(0).atomCount;
        instanceCount = 1;
    }
    return { atomCount: atomCount, instanceCount: instanceCount }
}

// get a sizeScore that will be used to set various representaion parameters
function getSizeScore(atomCount, mobile, backboneOnly) {
    var sizeScore = atomCount;
    if (mobile) { sizeScore *= 4; }
    if (backboneOnly) { sizeScore *= 10; }
    return sizeScore
}

// get a base value of scaleFactor which will be adjusted for specific reprs depending on the value of state.quality
function getScaleFactor$$1(sizeScore, instanceCount, backboneOnly) {
    var scaleFactor = (
        Math.min(
            1.5,
            Math.max(
                0.1,
                2000 / (sizeScore / instanceCount)
            )
        )
    );
    if (backboneOnly) { scaleFactor = Math.min(scaleFactor, 0.15); }
    return scaleFactor
}

return nglUi;

})));
//# sourceMappingURL=ngl-ui.js.map
