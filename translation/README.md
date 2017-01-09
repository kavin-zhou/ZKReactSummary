##React的思想
翻译自官方文档[Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)

在我们看来，React是使用JavaScript构建大型，快速的Web应用程序的首要方式。 它在我们的Facebook和Instagram上的扩展非常好。
React的重要作用之一就是, 构建应用的时候怎么去思考。 在本文档中，我们将向您介绍使用React构建可搜索的产品数据表的思考过程。<br />

###以一份设计稿开始
假设你已经得到了一份JSON API文档和设计稿, 设计稿如下图:

![](https://github.com/dev-zhoukang/ZKReactSummary/blob/master/imgs/img-1.png?raw=true)

JSON的API如下:
```
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
你要做的第一件事是开始绘制设计稿中的每个组件（和子组件），并给它们所有的名字。 如果你正在与一个设计师工作，他们可能已经这样做，所以去跟他们说他们的Photoshop图层名称可能最终是你的React组件的名称！
但是你怎么知道怎么拆分组件？ 只需使用相同的技术来决定是否应该创建一个新的函数或对象即可。 一种技术是单一指责原则，即一个组件应该只做一件事。 如果它最终变得庞大，它应该被分解成更小的子组件。

由于经常向用户显示JSON数据模型，一定发现如果模型正确构建，UI（或者说组件结构）将会很好地映射。 这是因为UI和数据模型倾向于遵循相同的信息架构，这意味着将UI划分为组件的工作通常是很简单的。 只需根据一个数据模型的拆分组件即可。

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

要正确构建您的应用程序，您首先需要考虑是: 应用程序需要的最小可变状态集。 这里的关键是：不要重复。 
确定您的App需要的`state`的是最精简的，其他能计算出来的变量就计算出来。 例如，如果您正在构建一个TODO列表，只需保留一个TODO项目的数组; 不要为计数保留单独的`state`变量。当渲染列表需要TODO计数时，只需取TODO项数组的长度即可。

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

```
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
* 先确定出基于这个`state`去渲染的所有组件
* 找到一个公共所有者组件(在结构层次中位于所有需要基于这个`state`渲染的组件之上的单个组件)
* 应该是公共所有者或层次结构中较高的另一个组件拥有该`state`
* 如果你找不到一个组件拥有`state`是可行的，那就创建一个持有`state`的新组件，并将其添加到公共所有者组件上层结构的某个位置。

让我们根据上面的策略来确定示例程序的`state`的位置：

* `ProductTable`需要根据状态过滤产品列表，搜索栏需要显示搜索文本和选中状态。
* 公共所有者组件是`FilterableProductTable`
* 过滤器文本(filter text)和检查值(checked value)放在`FilterableProductTable`是可行的.

所以我们决定我们的`state`放置在`FilterableProductTable`。 首先，将`getInitialState（）`方法添加到`FilterableProductTable`，返回`{filterText：''，inStockOnly：false}`以反映应用程序的初始状态。 
然后，将`filterText`和`inStockOnly`传递给`ProductTable`和`SearchBar`作为`props`。 最后，使用这些`props`来过滤`ProductTable`中的rows，并在`SearchBar`中设置表单字段的值。

你可以试着修改：将`filterText`设置为`“ball”`并刷新你的应用程序。 您将看到数据表已正确更新。

###第五步: 添加逆向数据流

```
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

React的单向数据流让我们很明晰地理解程序如何工作，但它需要比传统的双向数据绑定模式更多的`typing`。

如果尝试在当前实例中键入或选中该框，您将看到React忽略您的输入。 这是有意的，因为我们已将输入的值prop设置为始终等于从`FilterableProductTable`传递的状态。

我们要确保每当用户更改表单时，我们更新状态以反映用户输入。 因为组件只应该更新自己的`state`状态，`FilterableProductTable`将传递一个回调到`SearchBar`，每当状态应该更新时触发。 
我们可以使用`onChange`事件对输入进行通知。 并且`FilterableProductTable`传递的回调将调用`setState（）`，并且应用程序将被更新

虽然听起来比较复杂，但是几行代码就能实现。而且他能让我们更加明晰`React`的数据流通方式。

###后记
希望这给了你如何使用`React`来构建组件和应用程序的想法。 虽然它可能比你之前的构建方式的更多的代码，但是记住，代码的可读性远大于其写的方式，React让代码变得模块化和明晰化，当你开始构建大型的组件库时，你会欣赏这种明确性和模块性，并且使用代码重用，你的代码行将开始收缩。



