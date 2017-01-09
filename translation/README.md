##React的思想
翻译自[Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)

在我们看来，React是使用JavaScript构建大型，快速的Web应用程序的首要方式。 它在我们的Facebook和Instagram上的扩展非常好。
React的重要作用之一就是, 构建应用的时候怎么去思考。 在本文档中，我们将向您介绍使用React构建可搜索的产品数据表的思考过程。<br />

###以一份设计稿开始
假设你已经得到了一份JSON API文档和设计稿, 设计稿如下图:
![](../imgs/img-1)
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
####第一步: 将UI分离成组件层次
你要做的第一件事是开始绘制设计稿中的每个组件（和子组件），并给它们所有的名字。 如果你正在与一个设计师工作，他们可能已经这样做，所以去跟他们说他们的Photoshop图层名称可能最终是你的React组件的名称！
但是你怎么知道怎么拆分组件？ 只需使用相同的技术来决定是否应该创建一个新的函数或对象即可。 一种技术是单一指责原则，即一个组件应该只做一件事。 如果它最终变得庞大，它应该被分解成更小的子组件。

由于经常向用户显示JSON数据模型，一定发现如果模型正确构建，UI（或者说组件结构）将会很好地映射。 这是因为UI和数据模型倾向于遵循相同的信息架构，这意味着将UI划分为组件的工作通常是很简单的。 只需根据一个数据模型的拆分组件即可。

![](../imgs/img-2)

* FilterableProductTable (orange): contains the entirety of the example <br />
* SearchBar (blue): receives all user input <br />
* ProductTable (green): displays and filters the data collection based on user input <br />
* ProductCategoryRow (turquoise): displays a heading for each category <br />
* ProductRow (red): displays a row for each product <br />
看看ProductTable，你会看到表头（包含“name”和“price”标签）不是自己的组件。 这是一个个人偏好的问题。 对于这个例子，我们把它作为ProductTable的一部分，因为它是渲染数据收集的一部分，这是ProductTable的责任。 然而，如果这个头部变得复杂（如果我们添加用于排序的可用性），那么使它自己的ProductTableHeader组件会更好一些。
下面就是结构层次:
* FilterableProductTable
  * SearchBar
  * ProductTable
    * ProductCategoryRow
    * ProductRow

####第二步: 用React构建一个基础版本
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