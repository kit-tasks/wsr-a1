// SPDX-License-Identifier: MIT
pragma solidity >= 0.8;

import "./ERC20.sol";

contract CMON is ERC20 {
    constructor() ERC20(10000000,"CryptoMonster",12,"CMON") {
        approve(address(this), 10000000);
        
        address owner = 0x8a6Dc83c48829e6AA19bb457C7ADe3A83CbbDE40;
        address privateProvider = 0x507837eC8bd3351942D34D2a9dCE5B0344f89812;
        address publicProvider = 0x5496320B868C43f87d24B42eDEBb8E7b27F3dF63;
        address investor1 = 0xEe8161bAb0aFd27a2ad0FC3eC1C0C2Cb6AC97594;
        address investor2 = 0xf383a6797b5487C14324aC4FcCe329f2A2c17bD1;
        address bestFriend = 0x8AD59af8C44543508bb6581676B6CEaBa2D17927;
        _owner = owner;

        _roleID[owner] = roles.owner;
        _roleID[privateProvider] = roles.privateProvider;
        _roleID[publicProvider] = roles.publicProvider;

        _whitelist[owner] = true;
        _whitelist[privateProvider] = true;
        _whitelist[publicProvider] = true;
        _whitelist[investor1] = true;
        _whitelist[investor2] = true;
        _whitelist[bestFriend] = true;


        _transfer(investor1, 300000);
        _transfer(investor2, 400000);
        _transfer(bestFriend, 200000);

        _init = true;
    }

    ///
    /// CORE
    ///

    enum roles {user, owner, privateProvider, publicProvider}
    enum phases {notstarted, seed, privatePhase, publicPhase}

    mapping (address=>roles) _roleID;
    mapping (address=>bool) _whitelist;

    bool private _init;
    bool private _selfInvoke;
    address private _owner;

    modifier CheckOwner() {
        require(_roleID[msg.sender] == roles.owner, "you don't owner");
        _;
    }
    modifier CheckPrivate() {
        require(_roleID[msg.sender] == roles.privateProvider, "you don't owner");
        _;
    }
    modifier CheckPublic() {
        require(_roleID[msg.sender] == roles.publicProvider, "you don't owner");
        _;
    }

    function getRoleID(address userAddr) public view returns(roles) {
        return _roleID[userAddr];
    }

    function init() public {
        setTimeStart();
    }
    
    ///
    /// TIME
    ///

    uint private _time_start;
    uint private _time_dif;

    struct State {
        uint time_start;
        uint time_now;
        uint time_dif;
        uint time_system;
        phases phase;
    }

    function getTimeStart() public view returns(uint) {
        return _time_start;
    }
    function getTimeNow() public view returns(uint) {
        return block.timestamp;
    }
    function getTimeDif() public view returns(uint) {
        return _time_dif;
    }
    function getTimeSystem() public view returns(uint) {
        return getTimeStart() == 0 ? 0 : getTimeNow() + _time_dif;
    }
    function getPhase() public view returns(phases phase) {
        uint k = getTimeSystem() - getTimeStart();
        if (k == 0) {
            return phases.notstarted;
        } else if (k < 5 * 1 minutes) {
            return phases.seed;
        } else if (k < 10 * 1 minutes) {
            return phases.privatePhase;
        } else {
            return phases.publicPhase;
        }
    }
    function getState() public view returns(State memory) {
        return State(
            getTimeStart(),
            getTimeNow(),
            getTimeDif(),
            getTimeSystem(),
            getPhase()
        );
    }

    function setTimeStart() public CheckOwner() {
        require(_time_start == 0, "already init");
        _time_start = block.timestamp;
    }
    function setTimeDif(uint inMinutes) public {
        _time_dif = inMinutes * 1 minutes;
    }

    ///
    /// PRIVATE -- REQUEST
    ///

    mapping (uint=>Request) private _reqMap;
    mapping (address=>bool) private _reqMapSent;
    uint private _reqCount;

    struct Request {
        uint id;
        string name;
        address addr;
    }

    modifier CheckWhitelist(address from) {
        require(_whitelist[from], "address doesn't in whitelist");
        _;
    }

    function getRequests() public view returns(Request[] memory requests) {
        uint reqCount;
        for (uint256 i; i < _reqCount; i++) {
            if (_reqMap[i].addr != address(0)) {
                reqCount++;
            }
        }
        requests = new Request[](reqCount);

        uint c;
        for (uint256 i; i < reqCount; i++) {
            if (_reqMap[i].addr != address(0)) {
                requests[c] = _reqMap[i];
                c++;
            }
        }
    }

    function sendRequest(string memory name) public {
        require(!_whitelist[msg.sender], "you already in whitelist");
        require(!_reqMapSent[msg.sender], "you already sent request");
        _reqMap[_reqCount] = Request(_reqCount, name, msg.sender);
        _reqCount++;
    }
    function answerRequest(uint reqID, bool answer) public CheckPrivate {
        Request storage _request = _reqMap[reqID];
        _whitelist[_request.addr] = answer;
        delete _reqMap[reqID];
    }

    ///
    /// PUBLIC -- REWARRD
    ///

    function reward(address to, uint amount) public CheckPublic {
        _transferFrom(_owner, to, amount);
    }

    ///
    /// EVERYONE -- BUY
    ///

    uint private _microether = 10e12;
    uint private _privateCost = 750 * _microether;
    uint private _publicCost = 1000 * _microether;

    function getCost() public view returns(uint) {
        phases phase = getPhase();
        if (phase == phases.notstarted || phase == phases.seed) {
            revert("free sale not started");
        } else if (phase == phases.privatePhase) {
            return _privateCost;
        } else {
            return _publicCost;
        }
    }

    function setCost(uint newCost) public CheckPublic {
        _publicCost = newCost;
    }
    function buy() public payable {
        uint buyAmount = msg.value / getCost();
        require(buyAmount > 0, "not enough ETH");

        phases phase = getPhase();
        if (phase == phases.notstarted || phase == phases.seed) {
            revert("buying available only at private and public states");
        } else if (phase == phases.privatePhase) {
            require(buyAmount < 100000, "over then limit");
        } else {
            require(buyAmount < 5000, "over then limit");
        }

        _transferFrom(_owner, msg.sender, buyAmount);
    }

    ///
    /// TOKEN
    ///

    mapping (phases=>uint) _ownerLimits;
    uint private _seedLimit = 1000000;
    uint private _privateLimit = 3000000;
    uint private _publicLimit = 6000000;

    modifier CheckPhase(address _from) {

        _;
    }

    function getRemains() public view returns(uint) {
        phases phase = getPhase();
        if (phase == phases.notstarted) {
            return 0;
        } else if (phase == phases.seed) {
            return 0;
        } else if (phase == phases.privatePhase) {
            return _seedLimit - _ownerLimits[phases.privatePhase];
        } else {
            return _seedLimit + _publicLimit - _ownerLimits[phases.privatePhase] - _ownerLimits[phases.publicPhase];
        }
    }
    function balanceOfETH(address owner) public view returns(uint) {
        return owner.balance;
    }
    function balanceOf(address owner) public view override returns(uint) {
        phases phase = getPhase();
        if (phase == phases.notstarted) {
            return 0;
        } else {
            return super.balanceOf(owner);
        }
    }
    
    function _transfer(address _to, uint256 _value) private returns(bool) {
        return super.transfer(_to, _value);
    }

    function transfer(address _to, uint256 _value) public override returns(bool) {
        phases phase = getPhase();
        if (phase == phases.notstarted) {
            revert("CMON doesnt init");
        } else if (phase == phases.seed) {
            require(_value <= 100000, "over then limit");
        } else if (phase == phases.privatePhase) {
            require(_value <= 100000, "over then limit");        }
        if (msg.sender == _owner) {
            require(_value <= getRemains(), "over then limit");
            _ownerLimits[phase] += _value;
        }
        return super.transfer(_to, _value);
    }
    // uses by contract in functions 'reward' and 'buy' to ignore limits for owner
    function _transferFrom(address _from, address _to, uint256 _value) private returns(bool) {
        if (_init) {
            phases phase = getPhase();
            if (phase == phases.notstarted) {
                revert("CMON doesnt init");
            } else if (phase == phases.seed) {
                require(_from == _owner, "only owner can transfer at seed");
            } else if (phase == phases.privatePhase) {
                require(_whitelist[_from], "free sale not started");
            }
        }
        balances[_to] += _value;
        balances[_from] -= _value;
        emit Transfer(_from, _to, _value); //solhint-disable-line indent, no-unused-vars
        return true;
    }
    function transferFrom(address _from, address _to, uint256 _value) public override returns(bool) {
        if (_from == _owner) {
            phases phase = getPhase();
            require(_value <= getRemains(), "over then limit");
            _ownerLimits[phase] += _value;
        }
        return _transferFrom(_from, _to, _value);
    }
}