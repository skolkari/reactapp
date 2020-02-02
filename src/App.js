import React, {
  Component
} from 'react';
import './App.css';

const INVOICE_TITLES = {
  date: "Date",
  id: "Invoice #",
  name: "Display Name",
  service: "Service",
  amount: "Amount",
  balance: "Balance",
  refund: "Refund",
  status: "Status",
  action: "Action"
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      rows: [{
          date: '12/07/2019',
          id: 'INV00175318',
          name: "myreflex.click",
          service: 'Legal',
          amount: '$177',
          balance: '$177',
          refund: '-',
          status: 'Paid'
        },
        {
          date: '123',
          id: 'INV00175312',
          name: "myreflex.click",
          service: 'Website Builder Professional, POS Device, Localworks, POS Subscription, Business Maker, Legal',
          amount: '$177',
          balance: '$177',
          refund: '-',
          status: 'Paid'
        },
        {
          date: '123',
          id: 'INV00175314',
          name: "myreflex.click",
          service: 'Legal',
          amount: '$177',
          balance: '$177',
          refund: '-',
          status: 'Paid'
        },
        {
          date: '123',
          id: 'INV00175316',
          name: "myreflex.click",
          service: 'Website Builder Professional, POS Device, Localworks, POS Subscription, Business Maker, Legal',
          amount: '$177',
          balance: '$177',
          refund: '-',
          status: 'Paid'
        }
      ],
      columns: INVOICE_TITLES,
      displayCheckboxes: true,
      selectAll: false
    }

    this.state.rows.forEach(row => {
      row.checked = false;
    });
  }

  handleChange = (row) => {
    console.log('clicked row => ', row);
    let rows = [];
    let rowIndex = -1;
    rows = JSON.parse(JSON.stringify(this.state.rows));
    
    rows.filter(x => x.id === row.id)[0].checked = !row.checked;
    this.setState({
      rows: rows
    });
  }

  handleSelectAllClick = () => {
    console.log('event => ', this.state.selectAll);

    let rows = [];
    if (this.state.selectAll) {
      rows = JSON.parse(JSON.stringify(this.state.rows));
      rows.map(row => {
        row.checked = false;
      });
    } else {
      rows = JSON.parse(JSON.stringify(this.state.rows));
      rows.map(row => {
        row.checked = true;
      });
    }
    this.setState({
      rows: rows,
      selectAll: !this.state.selectAll
    });
  }

  renderTableHeader = () => {
    console.log('this.props => ', this.state);
    let headerColumns = Object.values(this.state.columns).map((colName, index) => {
      if(this.state.displayCheckboxes && index === 0) {
        return (
          <th key={index}>
            <label className="checkbox-container">{colName.toUpperCase()}
              <input type="checkbox" defaultChecked={this.state.selectAll} onClick={this.handleSelectAllClick}/>
              <span className="checkmark"></span>
            </label>
          </th>
        );
      } else {
        return (
          <th key={index}>{colName.toUpperCase()}</th>
        );
      }
     
    });

    return (
      <tr>{headerColumns}</tr>
    );
  }

  renderTableBody = () => {
    return this.state.rows.map((row, rowKey) => {
      console.log('row => ', row);
      let values = Object.keys(this.state.columns).map((colKey, index) => {
        let colName = this.state.columns[colKey];
        // console.log('colKey => ', colKey, ' colName => ', colName);
        if(this.state.displayCheckboxes && index === 0) {
          return (
            <td key={colKey} data-label={colName}>
              <label className="checkbox-container">{row[colKey]}
                <input type="checkbox" checked={row.checked} onChange={this.handleChange.bind(this, row)}/>
                <span className="checkmark"></span>
              </label>
            </td>
          );
        } else {
          if(colKey === 'action') {
            return (
              <td key={colKey} data-label={colName}>
                <a href="/">Download</a>
              </td>
            );
          } else if(colKey === 'balance') {
            return (
              <td key={colKey} data-label={colName} className="warning-text">{row[colKey]}</td>
            );
          } else {
            return (
              <td key={colKey} data-label={colName}>{row[colKey]}</td>
            );
          }
        }
      });
      return (
        <tr key={rowKey}>{values}</tr>
      );
    });
  }

  render() {
    console.log('this.state.rows => ', this.state.rows);
    return ( 
      <span></span>
      // <table className="responsive-table">
      //   <thead>
      //     {this.renderTableHeader()}
      //   </thead>
      //   <tbody>
      //     {this.renderTableBody()}
      //   </tbody>
      // </table>
    );
  }
}

export default App;