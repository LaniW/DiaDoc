import React, { useState } from 'react';
import { FileText, Globe, Terminal, Download, Trash2, FolderPlus, FilePlus } from 'lucide-react';

export default function DiaDoc() {
  const [activeTab, setActiveTab] = useState('link');
  const [url, setUrl] = useState('');
  const [docText, setDocText] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagram, setDiagram] = useState(null);
  const [error, setError] = useState(null);
  const [manualNodes, setManualNodes] = useState([
    { id: 1, type: 'folder', name: 'project-root', parent: null }
  ]);
  const [nextId, setNextId] = useState(2);
  const [selectedNode, setSelectedNode] = useState(null);

  // Mock function to simulate API call and API response
  const handleGenerateDiagram = async () => {
    setLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      if (activeTab === 'link' && !url) {
        throw new Error('Please enter a URL');
      }
      if (activeTab === 'docs' && !docText) {
        throw new Error('Please enter documentation text');
      }

      // Mock response based on input type
      let mockDiagram;
      if (url.includes('github.com')) {
        mockDiagram = `project-root/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── utils/
│   │   └── helpers.js
│   └── App.jsx
├── public/
│   └── index.html
├── .gitignore
├── package.json
└── README.md`;
      } else {
        mockDiagram = `documentation-project/
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   └── examples/
│       ├── basic.md
│       └── advanced.md
├── assets/
│   └── images/
└── index.html`;
      }

      setDiagram(mockDiagram);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addNode = (type) => {
    const newNode = {
      id: nextId,
      type,
      name: type === 'folder' ? 'new-folder' : 'new-file.txt',
      parent: selectedNode
    };
    setManualNodes([...manualNodes, newNode]);
    setNextId(nextId + 1);
  };

  const deleteNode = (id) => {
    const deleteNodeAndChildren = (nodeId) => {
      const children = manualNodes.filter(n => n.parent === nodeId);
      children.forEach(child => deleteNodeAndChildren(child.id));
      setManualNodes(prev => prev.filter(node => node.id !== nodeId));
    };
    deleteNodeAndChildren(id);
    if (selectedNode === id) setSelectedNode(null);
  };

  const updateNodeName = (id, name) => {
    setManualNodes(manualNodes.map(node => 
      node.id === id ? { ...node, name } : node
    ));
  };

  const renderTree = (parentId, depth) => {
    const children = manualNodes.filter(n => n.parent === parentId);
    return children.map(node => (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 p-2 mb-1 rounded cursor-pointer transition-colors ${
            selectedNode === node.id ? 'bg-purple-600' : 'hover:bg-slate-600'
          }`}
          onClick={() => setSelectedNode(node.id)}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {node.type === 'folder' ? '📁' : '📄'}
          <input
            type="text"
            value={node.name}
            onChange={(e) => updateNodeName(node.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-white border-none focus:outline-none"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteNode(node.id);
            }}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {node.type === 'folder' && renderTree(node.id, depth + 1)}
      </div>
    ));
  };

  const exportManualDiagram = () => {
    // Build tree structure including all nodes
    const buildTree = (parentId, indent = '') => {
      const children = manualNodes.filter(n => n.parent === parentId);
      return children.map((child, idx) => {
        const isLast = idx === children.length - 1;
        const prefix = indent + (isLast ? '└── ' : '├── ');
        const newIndent = indent + (isLast ? '    ' : '│   ');
        const childTree = child.type === 'folder' ? '\n' + buildTree(child.id, newIndent) : '';
        return prefix + child.name + (child.type === 'folder' ? '/' : '') + childTree;
      }).join('\n');
    };
    
    const rootNodes = manualNodes.filter(n => n.parent === null);
    
    if (rootNodes.length === 0) {
      setDiagram('No files or folders to export');
      return;
    }
    
    const tree = rootNodes.map(root => {
      const children = buildTree(root.id);
      return root.name + (root.type === 'folder' ? '/' : '') + (children ? '\n' + children : '');
    }).join('\n\n');
    
    setDiagram(tree);
  };

  const downloadDiagram = () => {
    if (!diagram) return;
    
    const blob = new Blob([diagram], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file-structure.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Dia<span className="text-purple-400">Doc</span>
          </h1>
          <p className="text-slate-300 text-lg">
            Generate beautiful file structure diagrams from URLs or documentation
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Tab Selection */}
          <div className="flex gap-2 mb-6 flex-wrap justify-center">
            <button
              onClick={() => setActiveTab('link')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'link'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Globe size={20} />
              From Link
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'docs'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FileText size={20} />
              Documentation Text
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'manual'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <FolderPlus size={20} />
              Manual Builder
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-slate-800 rounded-xl shadow-2xl p-8">
            {/* Link Tab */}
            {activeTab === 'link' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Generate from Link</h2>
                <div className="mb-6">
                  <label className="block text-slate-300 mb-2 font-medium">
                    URL (GitHub Repository or Documentation)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://github.com/username/repository or https://docs.example.com"
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                  <p className="text-slate-400 text-sm mt-2">
                    Supports GitHub repositories and documentation websites
                  </p>
                </div>

                <button
                  onClick={handleGenerateDiagram}
                  disabled={loading || !url}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate ASCII Diagram'}
                </button>
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === 'docs' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Generate from Documentation</h2>
                <div className="mb-6">
                  <label className="block text-slate-300 mb-2 font-medium">
                    Documentation Text
                  </label>
                  <textarea
                    value={docText}
                    onChange={(e) => setDocText(e.target.value)}
                    placeholder="Paste your documentation here. The AI will analyze it and extract the file structure...

Example:
The project has a src folder with components and utils.
Inside components, you'll find Header.jsx and Footer.jsx.
The public folder contains index.html.
At the root, we have package.json and README.md."
                    rows={12}
                    className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-purple-500 focus:outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleGenerateDiagram}
                  disabled={loading || !docText}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate ASCII Diagram'}
                </button>
              </div>
            )}

            {/* Manual Builder Tab */}
            {activeTab === 'manual' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Manual Diagram Builder</h2>
                
                <div className="mb-6">
                  <p className="text-slate-300 text-sm mb-4">
                    💡 Tip: Click a folder to select it, then add items inside. You can create multiple root-level folders!
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => addNode('folder')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                      <FolderPlus size={18} />
                      Add Folder
                    </button>
                    <button
                      onClick={() => addNode('file')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      <FilePlus size={18} />
                      Add File
                    </button>
                    {selectedNode ? (
                      <span className="flex items-center px-3 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm">
                        Adding to: <strong className="ml-1">{manualNodes.find(n => n.id === selectedNode)?.name}</strong>
                      </span>
                    ) : (
                      <span className="flex items-center px-3 py-2 bg-slate-700 text-slate-400 rounded-lg text-sm">
                        Adding to: <strong className="ml-1">Root Level</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                  <h3 className="text-white font-medium mb-3">
                    File Tree
                    {selectedNode && (
                      <span className="text-sm text-slate-400 ml-2">
                        (Selected: {manualNodes.find(n => n.id === selectedNode)?.name})
                      </span>
                    )}
                  </h3>
                  {renderTree(null, 0)}
                </div>

                <button
                  onClick={exportManualDiagram}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <Terminal size={18} className="inline mr-2" />
                  Export as ASCII
                </button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
                <p className="text-red-200">❌ Error: {error}</p>
              </div>
            )}
          </div>

          {/* Output Display */}
          {diagram && (
            <div className="mt-8 bg-slate-800 rounded-xl shadow-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Generated ASCII Diagram</h2>
                <button 
                  onClick={downloadDiagram}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
              
              <pre className="bg-slate-900 text-green-400 p-6 rounded-lg overflow-x-auto font-mono text-sm whitespace-pre">
{diagram}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}