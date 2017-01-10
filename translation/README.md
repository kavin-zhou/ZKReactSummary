##React的思想
翻译自官方文档[Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)

在我看来, React 是较早使用 JavaScript 构建大型、快速的 Web 应用程序的技术方案。它已经被我们广泛应
用于 Facebook 和 Instagram 。
React 众多优秀特征中的其中一部分就是,教会你去重新思考如何构建应用程序。 本文中,我将跟你一起使用 React 构建一个具备搜索功能的产品列表。<br />

###从设计稿(mock或译作'原型')开始
假设你已经得到了一份JSON API文档和设计稿, 设计稿如下图:

![](https://github.com/dev-zhoukang/ZKReactSummary/blob/master/imgs/img-1.png?raw=true)

JSON的API如下:
```js
[
  {category: "Sporting Goods", price: "$49.99", stocked: true, name: "Football"},
  {category: "Sporting Goods", price: "$9.99", stocked: true, name: "Baseball"},
  {category: "Sporting Goods", price: "$29.99", stocked: false, name: "Basketball"},
  {category: "Electronics", price: "$99.99", stocked: true, name: "iPod Touch"},
  {category: "Electronics", price: "$399.99", stocked: false, name: "iPhone 5"},
  {category: "Electronics", price: "$199.99", stocked: true, name: "Nexus 7"}
];
```
###第一步: 将UI分离成组件层次
你要做的第一件事是,为所有组件(及子组件)命名并画上线框图。假如你和设计师一起工作,也许他们已经完 成了这项工作,所以赶紧去跟他们沟通!他们的 Photoshop 图层名也许最终可以直接用于你的 React 组件名。

然而你如何知道哪些才能成为组件?想象一下,当你创建一些函数或对象时,用到一些类似的技术。其中一项技
术就是单一指责原则,指的是,理想状态下一个组件应该只做一件事,假如它功能逐渐变大就需要被拆分成更小
的子组件。

由于你经常需要将一个JSON数据模型展示给用户,因此你需要检查这个模型结构是否正确以便你的 UI (在这里 指组件结构)是否能够正确的映射到这个模型上。这是因为用户界面和数据模型在 信息构造 方面都要一致,这 意味着将你可以省下很多将 UI 分割成组件的麻烦事。你需要做的仅仅只是将数据模型分隔成一小块一小块的组 件,以便它们都能够表示成组件。

![](https://github.com/dev-zhoukang/ZKReactSummary/blob/master/imgs/img-2.png?raw=true)

```
* FilterableProductTable (orange): contains the entirety of the example <br />
* SearchBar (blue): receives all user input <br />
* ProductTable (green): displays and filters the data collection based on user input <br />
* ProductCategoryRow (turquoise): displays a heading for each category <br />
* ProductRow (red): displays a row for each product <br />
```
看看ProductTable，你会看到表头（包含“name”和“price”标签）不是自己的组件。 这是一个个人偏好的问题。 对于这个例子，我们把它作为ProductTable的一部分，因为它是渲染数据收集的一部分，这是ProductTable的责任。 
然而，如果这个头部变得复杂（如果我们添加用于排序的可用性），那么使它自己的`ProductTableHeader`组件会更好一些。
下面就是结构层次:
```
* FilterableProductTable
  * SearchBar
  * ProductTable
    * ProductCategoryRow
    * ProductRow
```

###第二步: 用React构建一个静态版本
```jsx
var ProductCategoryRow = React.createClass({
  render: function() {
    return (<tr>
        <th colSpan="2">{this.props.category}</th>
    </tr>);
  }
});

var ProductRow = React.createClass({
  render: function() {
    var name = this.props.product.stocked ?
      this.props.product.name :
      <span style={{color: 'red'}}>
        {this.props.product.name}
      </span>;
    return (
      <tr>
        <td>{name}</td>
        <td>{this.props.product.price}</td>
      </tr>
    );
  }
});

var ProductTable = React.createClass({
  render: function() {
    var rows = [];
    var lastCategory = null;
    this.props.products.forEach(function(product) {
      if (product.category !== lastCategory) {
        rows.push(<ProductCategoryRow category={product.category} key={product.category} />);
      }
      rows.push(<ProductRow product={product} key={product.name} />);
      lastCategory = product.category;
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});

var SearchBar = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" placeholder="Search..." />
        <p>
          <input type="checkbox" />
          {' '}
          Only show products in stock
        </p>
      </form>
    );
  }
});

var FilterableProductTable = React.createClass({
  render: function() {
    return (
      <div>
        <SearchBar />
        <ProductTable products={this.props.products} />
      </div>
    );
  }
});


var PRODUCTS = [
  {category: 'Sporting Goods', price: '$49.99', stocked: true, name: 'Football'},
  {category: 'Sporting Goods', price: '$9.99', stocked: true, name: 'Baseball'},
  {category: 'Sporting Goods', price: '$29.99', stocked: false, name: 'Basketball'},
  {category: 'Electronics', price: '$99.99', stocked: true, name: 'iPod Touch'},
  {category: 'Electronics', price: '$399.99', stocked: false, name: 'iPhone 5'},
  {category: 'Electronics', price: '$199.99', stocked: true, name: 'Nexus 7'}
];
 
ReactDOM.render(
  <FilterableProductTable products={PRODUCTS} />,
  document.getElementById('container')
);
```
* 现在已经拥有了组件层次结构，现在是实现应用程序的时候了。 最简单的方法是构建一个版本，它接收您的数据模型并呈现UI，但没有交互性。 
最好要解耦这些过程，因为构建静态版本需要大量的typing，没有thinking，添加交互性需要很多thinking，而不是很多typing。 我们看看为什么。
* 要构建呈现您的数据模型的应用程序的静态版本，您需要构建可复用其他组件和使用`props`传递数据的组件。 `props`是将数据从父级传递到子级的一种方式。 如果你熟悉`state`的概念，不要使用`state`来构建这个静态版本。 
因为`state`仅适用于交互性即随时间变化的数据。 由于这是一个静态版本的应用程序，所以你不需要`state`。
* 关于构建顺序, 您可以构建自顶向下或自下而上。 也就是说，您可以从层次结构中的较高层（即从FilterableProductTable开始）或在其中较低的层（ProductRow）开始构建组件。 
在更简单的例子中，通常应该从上到下构建，而在更大的项目中，更应该从底层向上构建应用和编写测试。
* 在此步骤结束时，您将有一个用于呈现您的数据模型的可重用组件库。 组件将只有`render（）`方法，因为这是一个静态版本的应用程序。 层次结构顶部的组件（FilterableProductTable）将把您的数据模型作为`props`。 
如果对基础数据模型进行更改并再次调用`ReactDOM.render（）`，则UI将更新。 很容易看到你的UI是如何更新的和更改的地方，因为没有什么复杂的。 React的**单向数据流**（也称为单向绑定）会保持模块化和快速化。

如果在此步骤需要帮助，请参阅[React文档](https://facebook.github.io/react/docs/hello-world.html)。

####一个简短的插曲：`Props` vs `State`
React中有两种类型的“模型”数据：props和state。 重要的是要了解两者之间的区别; 
如果你不确定有什么区别, 请参阅[state文档](https://facebook.github.io/react/docs/state-and-lifecycle.html)

###第三步: 确定 UI `state`的最小（但完整）表示
要使你的UI交互，你需要能够触发对基础数据模型的更改。 React的`state`让交互变得简单。

为了正确构建应用,首先需要考虑应用需要的最小的可变 `state` 数据模型集合。此处关键点在于精简:不要存储重复的数据。
构造出绝对最小的满足应用需要的最小 state 是有必要的,并且计算出其它强烈需要的东西。例如,如果构建一个 TODO 列表,仅保存一个 TODO 列表项的数组,而不要保存另外一个指代数组长度的 `state` 变 量。当想要渲染 TODO 列表项总数的时候,简单地取出 TODO 列表项数组的长度就可以了。

示例程序中所有需要的的数据如下:
* 产品的原始列表 (The original list of products)
* 用户在搜索框输入的文字 (The search text the user has entered)
* 选择框的值 (The value of the checkbox)
* 已过滤的产品列表 (The filtered list of products)

让我们找出哪一个应该是用`state`管理。 只需询问每个数据的三个问题：
1. 它是继承而来的`props`吗？ 如果是，它应该不是`state`。
2. 它是一直不变的吗?  如果是，它应该不是`state`。
3. 能通过其他的`state`或者`props`计算而来吗?  如果是，它应该不是`state`。

经过分析, 原始的产品列表作为`props`传递，所以不是`state`。 搜索文本和复选框似乎是`state`，因为它们随时间变化，不能从任何计算。 
最后，过滤的产品列表不是`state`，因为它可以通过将原始产品列表与复选框的搜索文本和值组合来计算。

综上, 我们的state只有两项:
* 用户在搜索框输入的文字
* 选择框的值

###第四步: 确定`state`的位置

```jsx
var ProductCategoryRow = React.createClass({
  render: function() {
    return (<tr>
        <th colSpan="2">{this.props.category}</th>
    </tr>);
  }
});

var ProductRow = React.createClass({
  render: function() {
    var name = this.props.product.stocked ?
      this.props.product.name :
      <span style={{color: 'red'}}>
        {this.props.product.name}
      </span>;
    return (
      <tr>
        <td>{name}</td>
        <td>{this.props.product.price}</td>
      </tr>
    );
  }
});

var ProductTable = React.createClass({
  render: function() {
    var rows = [];
    var lastCategory = null;
    this.props.products.forEach(function(product) {
      if (product.name.indexOf(this.props.filterText) === -1 || (!product.stocked && this.props.inStockOnly)) {
        return;
      }
      if (product.category !== lastCategory) {
        rows.push(<ProductCategoryRow category={product.category} key={product.category} />);
      }
      rows.push(<ProductRow product={product} key={product.name} />);
      lastCategory = product.category;
    }.bind(this));
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});

var SearchBar = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" placeholder="Search..." value={this.props.filterText} />
        <p>
          <input type="checkbox" checked={this.props.inStockOnly} />
          {' '}
          Only show products in stock
        </p>
      </form>
    );
  }
});

var FilterableProductTable = React.createClass({
  getInitialState: function() {
    return {
      filterText: '',
      inStockOnly: false
    };
  },

  render: function() {
    return (
      <div>
        <SearchBar
          filterText={this.state.filterText}
          inStockOnly={this.state.inStockOnly}
        />
        <ProductTable
          products={this.props.products}
          filterText={this.state.filterText}
          inStockOnly={this.state.inStockOnly}
        />
      </div>
    );
  }
});


var PRODUCTS = [
  {category: 'Sporting Goods', price: '$49.99', stocked: true, name: 'Football'},
  {category: 'Sporting Goods', price: '$9.99', stocked: true, name: 'Baseball'},
  {category: 'Sporting Goods', price: '$29.99', stocked: false, name: 'Basketball'},
  {category: 'Electronics', price: '$99.99', stocked: true, name: 'iPod Touch'},
  {category: 'Electronics', price: '$399.99', stocked: false, name: 'iPhone 5'},
  {category: 'Electronics', price: '$199.99', stocked: true, name: 'Nexus 7'}
];

ReactDOM.render(
  <FilterableProductTable products={PRODUCTS} />,
  document.getElementById('container')
);
```

OK，我们已经确定了什么是最小的应用`state`集。 接下来，我们需要确定哪个组件的`state`会突变, 哪个组件应该拥有此`state`。

记住：React的所有层次的内容都是单向数据流传输。 可能不是立即清楚哪个组件应该拥有什么`state`。 
对于新手来说，这通常是最具挑战性的部分，因此请按照以下步骤了解：

对于应用中所有的state:
* 找出每一个基于那个 `state` 渲染界面的组件。
* 找出共同的祖先组件(某个单个的组件,在组件树中位于需要这个 `state` 的所有组件的上面
* 要么是共同的祖先组件,要么是另外一个在组件树中位于更高层级的组件应该拥有这个`state`
* 如果找不出拥有这个 `state` 数据模型的合适的组件,创建一个新的组件来维护这个 `state` ,然后添加到组件树中,层级位于所有共同拥有者组件的上面。

让我们根据上面的策略来确定示例程序的`state`的位置：

* `ProductTable`需要根据状态过滤产品列表，搜索栏需要显示搜索文本和选中状态。
* 公共所有者组件是`FilterableProductTable`
* 过滤器文本(filter text)和检查值(checked value)放在`FilterableProductTable`是可行的.

所以我们决定我们的`state`放置在`FilterableProductTable`。 首先，将`getInitialState（）`方法添加到`FilterableProductTable`，返回`{filterText：''，inStockOnly：false}`以反映应用程序的初始状态。 
然后，将`filterText`和`inStockOnly`传递给`ProductTable`和`SearchBar`作为`props`。 最后，使用这些`props`来过滤`ProductTable`中的rows，并在`SearchBar`中设置表单字段的值。

你可以试着修改：将`filterText`设置为`“ball”`并刷新你的应用程序。 您将看到数据表已正确更新。

###第五步: 添加逆向数据流

```jsx
var ProductCategoryRow = React.createClass({
  render: function() {
    return (<tr><th colSpan="2">{this.props.category}</th></tr>);
  }
});

var ProductRow = React.createClass({
  render: function() {
    var name = this.props.product.stocked ?
      this.props.product.name :
      <span style={{color: 'red'}}>
        {this.props.product.name}
      </span>;
    return (
      <tr>
        <td>{name}</td>
        <td>{this.props.product.price}</td>
      </tr>
    );
  }
});

var ProductTable = React.createClass({
  render: function() {
    var rows = [];
    var lastCategory = null;
    this.props.products.forEach(function(product) {
      if (product.name.indexOf(this.props.filterText) === -1 || (!product.stocked && this.props.inStockOnly)) {
        return;
      }
      if (product.category !== lastCategory) {
        rows.push(<ProductCategoryRow category={product.category} key={product.category} />);
      }
      rows.push(<ProductRow product={product} key={product.name} />);
      lastCategory = product.category;
    }.bind(this));
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});

var SearchBar = React.createClass({
  handleChange: function() {
    this.props.onUserInput(
      this.refs.filterTextInput.value,
      this.refs.inStockOnlyInput.checked
    );
  },
  render: function() {
    return (
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          ref="filterTextInput"
          onChange={this.handleChange}
        />
        <p>
          <input
            type="checkbox"
            checked={this.props.inStockOnly}
            ref="inStockOnlyInput"
            onChange={this.handleChange}
          />
          {' '}
          Only show products in stock
        </p>
      </form>
    );
  }
});

var FilterableProductTable = React.createClass({
  getInitialState: function() {
    return {
      filterText: '',
      inStockOnly: false
    };
  },

  handleUserInput: function(filterText, inStockOnly) {
    this.setState({
      filterText: filterText,
      inStockOnly: inStockOnly
    });
  },

  render: function() {
    return (
      <div>
        <SearchBar
          filterText={this.state.filterText}
          inStockOnly={this.state.inStockOnly}
          onUserInput={this.handleUserInput}
        />
        <ProductTable
          products={this.props.products}
          filterText={this.state.filterText}
          inStockOnly={this.state.inStockOnly}
        />
      </div>
    );
  }
});


var PRODUCTS = [
  {category: 'Sporting Goods', price: '$49.99', stocked: true, name: 'Football'},
  {category: 'Sporting Goods', price: '$9.99', stocked: true, name: 'Baseball'},
  {category: 'Sporting Goods', price: '$29.99', stocked: false, name: 'Basketball'},
  {category: 'Electronics', price: '$99.99', stocked: true, name: 'iPod Touch'},
  {category: 'Electronics', price: '$399.99', stocked: false, name: 'iPhone 5'},
  {category: 'Electronics', price: '$199.99', stocked: true, name: 'Nexus 7'}
];

ReactDOM.render(
  <FilterableProductTable products={PRODUCTS} />,
  document.getElementById('container')
);
```

到目前为止，我们已经构建了一个应用程序，通过`props`和`state`沿着层次结构向下的函数正确执行。 
现在是时候以其他方式支持数据流：层次结构中深层的表单form组件需要更新`FilterableProductTable`中的`state`。

React 让这种数据流动非常明确,从而很容易理解应用是如何工作的,但是相对于传统的双向数据绑定,确实需 要输入更多的东西。 
React 提供了一个叫做 `ReactLink` 的插件来使其和双向数据绑定一样方便,但是考虑到这篇文章的目的,我们将会保持所有东西都直截了当。

如果尝试在当前实例中键入或选中该框，您将看到React忽略您的输入。 这是有意的，因为我们已将输入的值prop设置为始终等于从`FilterableProductTable`传递的状态。

我们要确保每当用户更改表单时，我们更新状态以反映用户输入。 因为组件只应该更新自己的`state`状态，`FilterableProductTable`将传递一个回调到`SearchBar`，每当状态应该更新时触发。 
我们可以使用`onChange`事件对输入进行通知。 并且`FilterableProductTable`传递的回调将调用`setState（）`，并且应用程序将被更新

虽然听起来比较复杂，但是几行代码就能实现。而且他能让我们更加明晰`React`的数据流通方式。

###后记
希望以上内容让你明白了如何思考用 React 去构造组件和应用。虽然可能比你之前要输入更多的代码,记住,读代码的时间远比写代码的时间多,并且阅读这种模块化的清晰的代码是相当容易的。
当你开始构建大型的组件库 的时候,你将会非常感激这种清晰性和模块化,并且随着代码的复用,整个项目代码量就开始变少了



