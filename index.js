
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
	console.log(ifcProject);
	const listRoot = document.getElementById('myUL');
	createNode(listRoot, ifcProject.type, ifcProject.children);
	generateTreeLogic();
}


function createNode(parent, text, children) {
	if(children.length === 0) {
		createLeafNode(parent, text);
	} else {
		// If there are multiple categories, group them together
		const grouped = groupCategories(children);
		createBranchNode(parent, text, grouped);
	}
}

function createBranchNode(parent, text, children) {

	// container
	const nodeContainer = document.createElement('li');
	parent.appendChild(nodeContainer);

	// title
	const title = document.createElement('span');
	title.textContent = text;
	title.classList.add('caret');
	nodeContainer.appendChild(title);

	// children
	const childrenContainer = document.createElement('ul');
	childrenContainer.classList.add('nested');
	nodeContainer.appendChild(childrenContainer);

	children.forEach(child => createNode(childrenContainer, child.type, child.children ));

}

function createLeafNode(parent, text) {
	const leaf = document.createElement('li');
	leaf.classList.add('leaf-node');
	leaf.textContent = text;
	parent.appendChild(leaf);
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

function generateTreeLogic() {
	const toggler = document.getElementsByClassName("caret");
	for (let i = 0; i < toggler.length; i++) {
		toggler[i].addEventListener("click", function() {
			this.parentElement.querySelector(".nested").classList.toggle("active");
			this.classList.toggle("caret-down");
		});
	}
}



//Collapsable table logic
[].forEach.call(document.querySelectorAll('#mytable .toggle'), function(el) {
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
    var elements = [...document.querySelectorAll('#mytable tr')].filter(function(element) {
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