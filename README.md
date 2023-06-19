# scraping



## Pré-requisitos

  Certifique-se de ter os seguintes requisitos instalados:

  - Node.js (versão X.X.X)
  - npm (versão X.X.X)

  
# Instalação do Node.js:

      Execute o seguinte comando para instalar o Node.js:
   
         npm init -y && npm install express npm install puppeteer
          
   
   ## Rodando o projeto
   
            src/scrap.js
   
            
  
   ## Endereço API
   
           http://localhost:3000
   
   ## Exemplo em PHP para printer.js
   
     <?php
        $client = new Client();
         $headers = [
         'Content-Type' => 'application/json'
                                  ];
                        $body = '{
              "email":"email@teste.com",
              "password": "12345689",
              "player": "teste2@yahoo.com.br",
              "dateFrom": "2023-06-01",
              "dateTo": "2023-06-13",
              "period": "week"
                                }
                                 ';
                               $request = new Request('GET', 'http://localhost:3000', $headers, $body);
                                $res = $client->sendAsync($request)->wait();
                                echo $res->getBody();

   

   
   

