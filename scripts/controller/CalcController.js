class CalcController {

    constructor() {
        // Inicializa o som que será usado nos botões
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false; // Controle de som ligado/desligado
        this._lastOperator = ''; // Último operador usado
        this._lastNumber = ''; // Último número exibido

        this._operation = []; // Armazena as operações em um array
        this._locale = 'pt-BR'; // Localização (idioma) da calculadora
        this._displayCalcEl = document.querySelector("#display"); // Elemento que exibe o cálculo
        this._dateEl = document.querySelector("#data"); // Elemento que exibe a data
        this._timeEl = document.querySelector("#hora"); // Elemento que exibe a hora
        this._currentDate; // Data atual
        this.initialize(); // Função de inicialização
        this.initButtonsEvents(); // Inicializa os eventos dos botões
        this.initKetboard(); // Inicializa os eventos do teclado
    }

    // Função que permite colar um valor da área de transferência
    pasteFromClipboard(){
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('Text');
            this.displayCalc = parseFloat(text); // Coloca o valor no display
            console.log(text); // Exibe no console o valor colado
        })
    }

    // Função que copia o valor do display para a área de transferência
    copyToClipboard() {
        let input = document.createElement('input'); // Cria um campo de input temporário
        input.value = this.displayCalc; // Coloca o valor do display nele
        document.body.appendChild(input); // Adiciona o input ao DOM
        input.select(); // Seleciona o conteúdo do input
        document.execCommand("Copy"); // Copia o valor para a área de transferência
        input.remove(); // Remove o campo de input do DOM
    }

    initialize() {
        this.setDisplayDateTime(); // Exibe a data e hora
        setInterval(() => {
            this.setDisplayDateTime(); // Atualiza a data e hora a cada segundo
        }, 1000);

        this.setLastNumberToDisplay(); // Exibe o último número
        this.pasteFromClipboard(); // Habilita o recurso de colar

        // Configura o evento de clique duplo nos botões 'ac' para alternar o som
        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio(); // Alterna o som
            });
        });
    }

    // Alterna o estado do som
    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    // Reproduz o som se o áudio estiver ativado
    playAudio(){
        if (this._audioOnOff) {
            this._audio.currentTime = 0; // Reseta o som
            this._audio.play(); // Reproduz o som
        }
    }

    // Inicializa os eventos do teclado para capturar as teclas pressionadas
    initKetboard() {
        document.addEventListener('keyup', e => {
            this.playAudio(); // Toca o som ao pressionar uma tecla

            console.log(e.key); // Exibe no console a tecla pressionada

            switch(e.key) {
                case 'Escape': // Limpar tudo
                    this.clearAll();
                    break;
                case 'Backspace': // Limpar última entrada
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%': // Adicionar operação
                    this.addOperation(e.key);
                    break;
                case 'Enter':  
                case '=': // Realizar cálculo
                    this.calc();
                    break;
                case '.':
                case ',': // Adicionar ponto
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9': // Adicionar número
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c': // Copiar para área de transferência
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });
    }

    // Função para adicionar múltiplos eventos a um mesmo elemento
    addEventListenerAll(element, events, fn){
        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false); // Adiciona o evento a cada um
        })
    }

    // Limpar tudo (resetar a operação e variáveis)
    clearAll(){
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    // Limpar a última entrada
    clearEntry(){
        this._operation.pop(); // Remove o último item da operação
        this.setLastNumberToDisplay();
    }

    // Pega o último valor da operação
    getLastOperation(){
        return this._operation[this._operation.length-1];
    }

    // Seta o último valor da operação
    setLastOperation(value) {
        this._operation[this._operation.length-1] = value;
    }

    // Verifica se o valor é um operador
    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }

    // Adiciona uma operação ao array de operações
    pushOperation(value){
        this._operation.push(value);
        if (this._operation.length > 3){
            this.calc(); // Se houver mais de 3 itens na operação, realiza o cálculo
        }
    }

    // Calcula o resultado da operação
    getResult() {
        try {
            return eval(this._operation.join("")); // Avalia a operação como uma string
        } catch(e) {
            setTimeout(() => {
                this.setError(); // Se houver erro, exibe 'Error'
            }, 1);
        }
    }

    // Função principal para realizar o cálculo
    calc() {
        let last = '';
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();

        if (last == '%') {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];
            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();
    }

    // Pega o último item da operação
    getLastItem(isOperator = true) {
        let lastItem;
        for (let i = this._operation.length-1; i >= 0; i--){
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }
        }

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }

        return lastItem;
    }

    // Exibe o último número no display
    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);
        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    // Adiciona uma operação ao cálculo
    addOperation(value) {
        if (isNaN(this.getLastOperation())) {
            if (this.isOperator(value)) {
                this.setLastOperation(value);
            }  else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }
        } else {
            if(this.isOperator(value)) {
                this.pushOperation(value);
            } else {
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            }
        }
    }

    // Exibe um erro no display
    setError(){
        this.displayCalc = "Error";
    }

    // Adiciona um ponto decimal
    addDot() {
        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();
    }

    // Executa a ação do botão
    execBtn(value){
        this.playAudio();

        switch(value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();                
                break;
            case 'ponto':
                this.addDot('.'); 
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }
    }

    // Inicializa os eventos dos botões na interface
    initButtonsEvents(){
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        buttons.forEach((btn, index) => {
            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-", "");
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });
        });
    }

    // Atualiza a data e a hora no display
    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    // Getter e setter para data e hora
    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    // Getter e setter para o cálculo
    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){
        if (value.toString().length > 10) {
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    // Getter e setter para a data atual
    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }
}
