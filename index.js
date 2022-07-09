
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({container});
viewer.axes.setAxes();
viewer.grid.setGrid();
viewer.IFC.setWasmPath("../../../");

init();

async function init() {
	const model = await viewer.IFC.loadIfcUrl('./IFC/01.ifc');
	const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
	const listRoot = document.getElementById('boq');
    // listRoot.setAttribute('data-depth',0)
	// createNode(listRoot, listRoot, ifcProject.type, ifcProject.children);
    populateIfcTable(listRoot, ifcProject)
	// generateTreeLogic();
}

function populateIfcTable(table, ifcProject) {
    const initialDepth = 0;

    createNode(table, ifcProject.type, initialDepth, ifcProject.children);
}


function createNode(table, text, depth, children) {

	if(children.length === 0) {
		createLeafRow(table, text, depth);
	} else {
		// If there are multiple categories, group them together
		const grouped = groupCategories(children);
		createBranchRow(table, text, depth, grouped);
	}
}

function createBranchRow(table, text, depth, children) {

    const row = document.createElement('tr');
    const className = 'level' + depth;
    row.classList.add(className);
    row.classList.add('collapse');
    row.setAttribute('data-depth', depth);

    const dataName = document.createElement('td');


    const toggle = document.createElement('span');
    toggle.classList.add('toggle');
    toggle.classList.add('collapse');

    

    dataName.textContent = text;
    dataName.insertBefore(toggle, dataName.firstChild);

    row.appendChild(dataName);
	table.appendChild(row); 

	// container
	// const nodeContainer = document.createElement('tr');
	// table.appendChild(nodeContainer);

	// // title
	// const title = document.createElement('td');
	// title.textContent = text;
	// title.classList.add('caret');
	// nodeContainer.appendChild(title);

	// children
	// const childrenContainer = document.createElement('tr');
	// // childrenContainer.classList.add('nested');
	// table.appendChild(childrenContainer);

    depth = depth+1;

	children.forEach(child => createNode(table, child.type, depth, child.children ));

}



function createLeafRow(table, text, depth) {
	const leaf = document.createElement('tr');
    const className = 'level'+ depth;
    leaf.classList.add(className);
    leaf.classList.add('collapse');
    leaf.setAttribute('data-depth', depth);

    const dataName = document.createElement('td');
    dataName.textContent = text;

    leaf.appendChild(dataName);
	table.appendChild(leaf);
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

// function generateTreeLogic() {
// 	const toggler = document.getElementsByClassName("caret");
// 	for (let i = 0; i < toggler.length; i++) {
// 		toggler[i].addEventListener("click", function() {
// 			this.parentElement.querySelector(".nested").classList.toggle("active");
// 			this.classList.toggle("caret-down");
// 		});
// 	}
// }



//Collapsable table logic
[].forEach.call(document.querySelectorAll('#boq .toggle'), function(el) {
    el.addEventListener('click', function() {
      var el = this;
      var tr = el.closest('tr');
      var children = findChildren(tr);
      var subnodes = children.filter(function(element) {
        return element.matches('.expand');
      });
      subnodes.forEach(function(subnode) {
        var subnodeChildren = findChildren(subnode);
        children = children.filter(function(element) {
            return !subnodeChildren.includes(element);
        });
              console.log(children);
        //children = children.not(subnodeChildren);
      });
      if (tr.classList.contains('collapse')) {
        tr.classList.remove('collapse');
        tr.classList.add('expand');
        children.forEach(function(child) {
          child.style.display = 'none';
        });
      } else {
        tr.classList.remove('expand');
        tr.classList.add('collapse');
        children.forEach(function(child) {
          child.style.display = '';
        });
      }
    })
  })
  
  var findChildren = function(tr) {
    var depth = tr.dataset.depth;
    var elements = [...document.querySelectorAll('#boq tr')].filter(function(element) {
      return element.dataset.depth <= depth;
    });
    var next = nextUntil(tr, elements);
    return next;
  };
  
  var nextUntil = function(elem, elements, filter) {
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