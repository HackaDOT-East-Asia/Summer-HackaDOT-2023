// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "./interfaces/IERC20.sol";
import "./libs/SafeMath.sol";


contract SecurityToken is IERC20 {
    using SafeMath for uint;
    
    mapping (address => uint256) public balances;
    mapping (address => mapping(address => uint256)) public allowed;

    string public override name;
    uint8 public override decimals;
    string public override symbol;

    uint256 public override totalSupply;

    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    address public mintor;

    constructor(
        string memory _name,
        uint8 _decimal,
        string memory _symbol
    ) {
        name = _name;
        decimals = _decimal;
        symbol = _symbol;
        mintor = msg.sender;

    }

    function mint(address subscriber, uint256 amount) external {
        require(msg.sender == mintor, "unauthorized operation");
        _mint(subscriber, amount);
    }

    function mint(address[] memory subscribers, uint256[] memory values, uint256 _totalSupply) external {
        require(msg.sender == mintor, "unauthorized operation");
        require(subscribers.length == values.length, "invalid arguments");

        for(uint8 i = 0; i < subscribers.length; i++) {
            _mint(subscribers[i], values[i]);
        }

        require(totalSupply == _totalSupply, "not matched amount for total supplied");

    }

    // holder => block height => balance
    mapping (address => mapping(uint256 => uint256)) public balanceSnapshot;
    // holder => changed balance record array
    mapping (address => uint256[]) public balanceChangedRecord;

    struct Income {
        uint256 startBlock;
        uint256 endBlock;
        uint256 amountPerBlock;
        uint256 totalSupply;
    }

    // income token => income array
    mapping (address => Income[]) public incomes;

    // income token => holder => latest offset of took income
    mapping (address => mapping(address => uint256)) public withdrawnIncomeOffset;

    address[] incomeTokens;

    function _balanceSnapshot(address holder) internal {
        balanceSnapshot[holder][block.number] = balances[holder];
        balanceChangedRecord[holder].push(block.number);
    }


    function depositIncome(
        address _token, 
        uint256 _amount, 
        uint256 _startBlock, 
        uint256 _endBlock, 
        uint256 _totalSupply) external {

        IERC20 incomeToken = IERC20(_token);
        require(incomeToken.allowance(msg.sender, address(this)) >= _amount, "not enought allowed amount");
        require(_startBlock <= _endBlock, "invalid block duration");
        incomeToken.transferFrom(msg.sender, address(this), _amount);

        if(incomes[_token].length == 0) {
            incomeTokens.push(_token);
        }

        Income storage newIncome = incomes[_token].push();
        newIncome.startBlock = _startBlock;
        newIncome.endBlock = _endBlock;
        newIncome.amountPerBlock = _amount / (_endBlock - _startBlock + 1);
        newIncome.totalSupply = _totalSupply;
    }

    function withdrawIncome(address _token) external {
        uint totalDividendIncome = 0;
        for(uint i = withdrawnIncomeOffset[_token][msg.sender]; i < incomes[_token].length; i ++) {
            Income memory income = incomes[_token][i];
            uint256[] memory record = balanceChangedRecord[msg.sender];
            mapping(uint256 => uint256) storage snapshot = balanceSnapshot[msg.sender];
            for(uint j = 0; j < record.length; j++) {
                uint256 _startBlock = record[j];
                uint256 _endBlock = j + 1 == record.length ? block.number : record[j + 1] - 1;
                if(_startBlock > income.endBlock || _endBlock < income.startBlock) {
                    continue;
                }
                uint startBlock = _startBlock < income.startBlock ? income.startBlock : _startBlock;
                uint endBlock = _endBlock > income.endBlock? income.endBlock : _endBlock;
                totalDividendIncome += 
                    snapshot[record[j]] * income.amountPerBlock * (endBlock - startBlock + 1) / income.totalSupply;
            }
        }
        IERC20(_token).transfer(msg.sender, totalDividendIncome);
        withdrawnIncomeOffset[_token][msg.sender] = incomes[_token].length - 1;
    }



    function _mint(address _to, uint256 _value) internal{
        totalSupply = totalSupply.add(_value);
        balances[_to] = balances[_to].add(_value);
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
        _balanceSnapshot(_to);
    }

    function _burn(address _from, uint _value) internal {
        balances[_from] = balances[_from].sub(_value);
        totalSupply = totalSupply.sub(_value);
        emit Burn(address(0), _value);
        emit Transfer(_from, address(0), _value);

        _balanceSnapshot(_from);

    }

    function _transferFrom(
        address from,
        address to,
        uint256 value
    ) internal returns(bool success) {
        balances[from] = balances[from].sub(value);
        balances[to] = balances[to].add(value);
        emit Transfer(from, to, value);

        _balanceSnapshot(from);
        _balanceSnapshot(to);

        return true;
    }

    function transfer(address to, uint256 value) external override returns(bool) {
        
        return _transferFrom(msg.sender, to, value);

    }

    function transferFrom(
        address from, 
        address to, 
        uint256 value
        ) external override returns (bool) {

        allowed[from][msg.sender] = allowed[from][msg.sender].sub(value);
        return _transferFrom(from, to, value);
    }

    function balanceOf(address _owner) external override view returns(uint) {

        return balances[_owner];

    }

    function _approve(
        address owner,
        address _spender,
        uint _value
    ) internal returns(bool) {
        allowed[owner][_spender] = _value;
        emit Approval(owner, _spender, _value); 
        return true;     
    }

    function approve(address _spender, uint _value) external override returns(bool) {

        return _approve(msg.sender, _spender, _value);   
    }

    function allowance(address _owner, address _spender) external override view returns(uint256) {

        return allowed[_owner][_spender];

    }
}