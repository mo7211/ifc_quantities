
import { IfcViewerAPI } from 'web-ifc-viewer';
import { Color } from 'three';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
viewer.axes.setAxes();
viewer.grid.setGrid();

loadIfc('01.ifc');

async function loadIfc(url) {
  // await viewer.IFC.setWasmPath("");
  const model = await viewer.IFC.loadIfcUrl(url);
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;

  const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
  createTreeTable(ifcProject);
}

//Set up clipping planes
const clipperButton = document.getElementById('clipperButton');

let clippingPlanesActive = false;
clipperButton.onclick = () => {
  clippingPlanesActive = !clippingPlanesActive;
  viewer.clipper.active = clippingPlanesActive;

  if (clippingPlanesActive) {
    clipperButton.classList.add('active');
  } else {
    clipperButton.classList.remove('active');
  }
}

window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();

window.ondblclick = async () => {
  if (clippingPlanesActive) {
    viewer.clipper.createPlane();
  } else if (propertiesActive) {
    const result = await viewer.IFC.selector.highlightIfcItem();
    if (!result) return;
    const { modelID, id } = result;
    const props = await viewer.IFC.getProperties(modelID, id, true, false);
    createPropertiesMenu(props);
  } else {
    viewer.IFC.selector.pickIfcItem();
  }
}

window.onkeydown = (event) => {
  if (event.code = 'delete' && clippingPlanesActive) {
    viewer.clipper.deletePlane();
  }
}

//properties

// Properties menu
const propertiesButton = document.getElementById('propertiesButton');
const propsGUI = document.getElementById("ifc-property-menu-root");

let propertiesActive = false;
propertiesButton.onclick = () => {
  propertiesActive = !propertiesActive;

  if (propertiesActive) {
    propertiesButton.classList.add('active');
    propsGUI.style.display = '';
  } else {
    propertiesButton.classList.remove('active');
    propsGUI.style.display = "none";
  }
}

function createPropertiesMenu(properties) {
  console.log(properties);

  removeAllChildren(propsGUI);

  delete properties.psets;
  delete properties.mats;
  delete properties.type;


  for (let key in properties) {
    createPropertyEntry(key, properties[key]);
  }

}

function createPropertyEntry(key, value) {
  const propContainer = document.createElement("div");
  propContainer.classList.add("ifc-property-item");

  if (value === null || value === undefined) value = "undefined";
  else if (value.value) value = value.value;

  const keyElement = document.createElement("div");
  keyElement.textContent = key;
  propContainer.appendChild(keyElement);

  const valueElement = document.createElement("div");
  valueElement.classList.add("ifc-property-value");
  valueElement.textContent = value;
  propContainer.appendChild(valueElement);

  propsGUI.appendChild(propContainer);
}

//functions

function createTreeTable(ifcProject) {

  const tableRoot = document.getElementById('boq');
  removeAllChildren(tableRoot);
  populateIfcTable(tableRoot, ifcProject)
  implementTreeLogic();

  const buttonCollapse = document.getElementById('collapseButton');
  buttonCollapse.addEventListener('click', collapseTable);


  // const buttonExpand = document.getElementById('expandButton')
  // buttonExpand.addEventListener('click', expandTable);

}

//Not working functions: 

function collapseTable() {
  const elements = document.getElementsByClassName('collapse');
  elements[0].classList.remove('collapse');
  elements[0].classList.add('expand');

  for (let element in elements) {
    if (element.length > 0) {

      // element.classList.remove('collapse');
      // element.classList.add('expand');
    }
  }
}

// function expandTable() {
//   const elements = document.getElementsByClassName('expand');
//   console.log(elements);  
//   for (let element in elements) {
//       console.log(element);
//       // element.classList.remove('expand');
//       // element.classList.add('collapse');
//   }
// }

function populateIfcTable(table, ifcProject) {
  const initialDepth = 0;
  createNode(table, ifcProject, initialDepth, ifcProject.children);
}


function createNode(table, node, depth, children) {

  if (children.length === 0) {
    createLeafRow(table, node, depth);
  } else {
    // If there are multiple categories, group them together
    const grouped = groupCategories(children);
    createBranchRow(table, node, depth, grouped);
  }
}

function createBranchRow(table, node, depth, children) {

  const row = document.createElement('tr');
  const className = 'level' + depth;
  row.classList.add(className);
  row.classList.add('collapse');
  row.setAttribute('data-depth', depth);

  const dataName = document.createElement('td');


  const toggle = document.createElement('span');
  toggle.classList.add('toggle');
  toggle.classList.add('collapse');


  dataName.textContent = node.type;
  dataName.insertBefore(toggle, dataName.firstChild);

  row.appendChild(dataName);
  table.appendChild(row);

  depth = depth + 1;

  children.forEach(child => createNode(table, child, depth, child.children));

}



function createLeafRow(table, node, depth) {
  const row = document.createElement('tr');
  const className = 'level' + depth;
  row.classList.add(className);
  row.classList.add('collapse');
  row.setAttribute('data-depth', depth);

  const dataName = document.createElement('td');
  dataName.textContent = node.type;
  const dataId = document.createElement('td');
  dataId.textContent = node.expressID;
  row.appendChild(dataName);
  const price = document.createElement('td');
  price.textContent = 'Area';
  row.appendChild(dataId);
  row.appendChild(price);
  table.appendChild(row);

  row.onmouseenter = () => {
    viewer.IFC.selector.prepickIfcItemsByID(0, [node.expressID]);
  }

  row.onclick = async () => {
    viewer.IFC.selector.pickIfcItemsByID(0, [node.expressID]);
  }

}

function groupCategories(children) {
  const types = children.map(child => child.type);
  const uniqueTypes = new Set(types);
  if (uniqueTypes.size > 1) {
    const uniquesArray = Array.from(uniqueTypes);
    children = uniquesArray.map(type => {
      return {
        expressID: -1,
        type: type + 'S',
        children: children.filter(child => child.type.includes(type)),
      };
    });
  }
  return children;
}

//Collapsable table logic
function implementTreeLogic() {
  [].forEach.call(document.querySelectorAll('#boq .toggle'), function (el) {
    el.addEventListener('click', function () {
      var el = this;
      var tr = el.closest('tr');
      var children = findChildren(tr);
      var subnodes = children.filter(function (element) {
        return element.matches('.expand');
      });
      subnodes.forEach(function (subnode) {
        var subnodeChildren = findChildren(subnode);
        children = children.filter(function (element) {
          return !subnodeChildren.includes(element);
        });
        console.log(children);
        //children = children.not(subnodeChildren);
      });
      if (tr.classList.contains('collapse')) {
        tr.classList.remove('collapse');
        tr.classList.add('expand');
        children.forEach(function (child) {
          child.style.display = 'none';
        });
      } else {
        tr.classList.remove('expand');
        tr.classList.add('collapse');
        children.forEach(function (child) {
          child.style.display = '';
        });
      }
    })
  })
}

var findChildren = function (tr) {
  var depth = tr.dataset.depth;
  var elements = [...document.querySelectorAll('#boq tr')].filter(function (element) {
    return element.dataset.depth <= depth;
  });
  var next = nextUntil(tr, elements);
  return next;
};

var nextUntil = function (elem, elements, filter) {
  var siblings = [];
  elem = elem.nextElementSibling;
  while (elem) {
    if (elements.includes(elem)) break;
    if (filter && !elem.matches(filter)) {
      elem = elem.nextElementSibling;
      continue;
    }
    siblings.push(elem);
    elem = elem.nextElementSibling;
  }
  return siblings;
};

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

